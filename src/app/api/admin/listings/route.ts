import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''
    const userId = searchParams.get('userId') || ''
    const userName = searchParams.get('userName') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { contactName: { contains: search } },
      ]
    }

    if (status) where.status = status
    if (userId) where.userId = userId
    if (userName) {
      where.user = { name: { contains: userName } }
    }
    if (startDate || endDate) {
      const createdAt: Record<string, Date> = {}
      if (startDate) createdAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        createdAt.lte = end
      }
      where.createdAt = createdAt
    }
    if (category) {
      const cat = await db.category.findFirst({ where: { slug: category } })
      if (cat) where.categoryId = cat.id
    }

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          location: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true } },
          _count: { select: { reports: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.listing.count({ where }),
    ])

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error fetching admin listings:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    const body = await request.json()

    const { listingId, status, isFeatured, isPromoted } = body

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 })
    }

    const listing = await db.listing.findUnique({ where: { id: listingId } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const validStatuses = ['draft', 'pending', 'active', 'sold', 'expired', 'suspended', 'archived']
    const updateData: Record<string, unknown> = {}
    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `status must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
      }
      updateData.status = status
    }
    if (typeof isFeatured === 'boolean') {
      updateData.isFeatured = isFeatured
      if (isFeatured) {
        updateData.featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      } else {
        updateData.featuredUntil = null
      }
    }
    if (typeof isPromoted === 'boolean') updateData.isPromoted = isPromoted

    const statusChanged = status && status !== listing.status

    const updated = await db.listing.update({
      where: { id: listingId },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        location: { select: { id: true, name: true, slug: true } },
      },
    })

    if (statusChanged) {
      await db.moderationLog.create({
        data: {
          userId: admin.id,
          listingId,
          action: status === 'active' ? 'approved' : status === 'suspended' ? 'suspended' : 'manual_review',
          reason: `Status changed from ${listing.status} to ${status}`,
          details: JSON.stringify({ previousStatus: listing.status, newStatus: status }),
        },
      })

      if (status === 'active') {
        await db.notification.create({
          data: {
            userId: listing.userId,
            type: 'system',
            title: 'Listing Approved',
            body: `Your listing "${listing.title}" has been approved and is now live.`,
            data: JSON.stringify({ listingId, slug: listing.slug }),
          },
        })
      } else if (status === 'suspended') {
        await db.notification.create({
          data: {
            userId: listing.userId,
            type: 'system',
            title: 'Listing Suspended',
            body: `Your listing "${listing.title}" has been suspended. Please check your email for details.`,
            data: JSON.stringify({ listingId, slug: listing.slug }),
          },
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error moderating listing:', error)
    return NextResponse.json({ error: 'Failed to moderate listing' }, { status: 500 })
  }
}
