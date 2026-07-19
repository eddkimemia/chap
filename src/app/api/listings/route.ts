import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { maskContact } from '@/lib/mask'
import { rateLimit } from '@/lib/rate-limit'
import { autoFlag } from '@/lib/auto-flag'

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const suffix = Math.random().toString(36).substring(2, 8)
  return `${base}-${suffix}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`listings:${ip}`, 60, 60)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const location = searchParams.get('location') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const condition = searchParams.get('condition') || ''
    const sort = searchParams.get('sort') || 'newest'
    const featured = searchParams.get('featured') || ''
    const status = searchParams.get('status') || ''
    const mine = searchParams.get('mine') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    // Expire past-due featured/boosted/promoted listings
    const now = new Date()
    await db.listing.updateMany({ where: { featuredUntil: { lt: now }, isFeatured: true }, data: { isFeatured: false, featuredUntil: null } })
    await db.listing.updateMany({ where: { promotedUntil: { lt: now }, isPromoted: true }, data: { isPromoted: false, promotedUntil: null } })
    await db.listing.updateMany({ where: { boostUntil: { lt: now }, boostCount: { gt: 0 } }, data: { boostCount: 0, boostUntil: null } })

    const user = await getCurrentUser(request)
    const where: Record<string, unknown> = {}

    if (mine) {
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      where.userId = user.id
      if (status) where.status = status
    } else {
      if (status) {
        if (!user || status !== 'active') {
          return NextResponse.json({ error: 'Invalid filter' }, { status: 400 })
        }
        where.status = status
      } else {
        where.status = 'active'
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (category) {
      const cat = await db.category.findFirst({ where: { slug: category } })
      if (cat) {
        if (cat.parentId) {
          where.categoryId = cat.id
        } else {
      const childIds = await db.category
            .findMany({ where: { parentId: cat.id }, select: { id: true } })
            .then((cats) => cats.map((c) => c.id))
          where.categoryId = { in: [cat.id, ...childIds] }
        }
      }
    }

    if (location) {
      const loc = await db.location.findFirst({ where: { slug: location } })
      if (loc) where.locationId = loc.id
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {}
      if (minPrice) priceFilter.gte = parseFloat(minPrice)
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice)
      where.price = priceFilter
    }

    if (condition) where.condition = condition
    if (featured === 'true') where.isFeatured = true

    if (mine && user) {
      where.userId = user.id
    }

    let sortField: Record<string, string> = { createdAt: 'desc' }
    if (sort === 'price-asc') sortField = { price: 'asc' }
    if (sort === 'price-desc') sortField = { price: 'desc' }
    if (sort === 'popular') sortField = { views: 'desc' }
    const orderBy: Record<string, string>[] = [{ isFeatured: 'desc' }, sortField]

    const selectFields: Record<string, unknown> = {
      id: true,
      slug: true,
      title: true,
      description: true,
      price: true,
      originalPrice: true,
      currency: true,
      condition: true,
      categoryId: true,
      locationId: true,
      isFeatured: true,
      isPromoted: true,
      isNegotiable: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      customFields: true,
      tags: true,
      status: true,
      user: { select: { id: true, name: true, avatar: true, isVerified: true } },
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      location: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { order: 'asc' } },
    }

    selectFields.contactName = true
    selectFields.contactPhone = true
    selectFields.contactEmail = true

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        select: selectFields,
        orderBy,
        skip,
        take: limit,
      }),
      db.listing.count({ where }),
    ])

    const masked = listings.map((l) => {
      const c = l as Record<string, unknown>
      return {
        ...l,
        contactName: !mine ? maskContact(c.contactName as string) : c.contactName as string,
        contactPhone: !mine ? maskContact(c.contactPhone as string) : c.contactPhone as string,
        contactEmail: !mine ? maskContact(c.contactEmail as string) : c.contactEmail as string,
      }
    })

    return NextResponse.json({
      listings: masked,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const fullUser = await db.user.findUnique({ where: { id: user.id }, select: { isPhoneVerified: true, isEmailVerified: true, email: true, phone: true } })
    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (!fullUser.isPhoneVerified && !fullUser.isEmailVerified) {
      return NextResponse.json(
        { error: 'Please verify your phone number or email before posting. Check your inbox for a verification code.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const activeSub = await db.subscription.findFirst({
      where: { userId: user.id, status: 'active', endDate: { gte: new Date() } },
      include: { plan: true },
    })
    const plan = activeSub?.plan ?? { maxListings: 5, maxImages: 5 }

    const userListingCount = await db.listing.count({ where: { userId: user.id, status: { not: 'sold' } } })
    if (userListingCount >= plan.maxListings) {
      return NextResponse.json(
        { error: `You have reached the maximum of ${plan.maxListings} active listings on your current plan. Upgrade to list more.` },
        { status: 403 }
      )
    }

    const {
      title,
      description,
      price,
      condition,
      categorySlug,
      locationSlug,
      contactName,
      contactPhone,
      contactEmail,
      isNegotiable,
      customFields,
      tags,
      status,
    } = body

    if (!title || !categorySlug || !locationSlug || !contactName || !contactPhone) {
      return NextResponse.json(
        { error: 'Title, category, location, contactName, and contactPhone are required' },
        { status: 400 }
      )
    }

    const category = await db.category.findFirst({ where: { slug: categorySlug } })
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }

    const location = await db.location.findFirst({ where: { slug: locationSlug } })
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 400 })
    }

    const slug = generateSlug(title)

    const allowedStatuses = ['pending', 'draft']
    const listingStatus = status && allowedStatuses.includes(status) ? status : 'pending'

    const listing = await db.listing.create({
      data: {
        userId: user.id,
        title,
        slug,
        description: description || '',
        price: price || 0,
        condition: condition || 'Used',
        status: listingStatus,
        categoryId: category.id,
        locationId: location.id,
        contactName,
        contactPhone,
        contactEmail: contactEmail || '',
        isNegotiable: isNegotiable || false,
        customFields: customFields ? JSON.stringify(customFields) : '{}',
        tags: tags ? JSON.stringify(tags) : '[]',
        publishedAt: new Date(),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        location: { select: { id: true, name: true, slug: true } },
      },
    })

    autoFlag(title, description || '', user.id, listing.id).catch(() => {})

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
