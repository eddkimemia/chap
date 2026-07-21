import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { nextDisplayId } from '@/lib/display-id'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(_request)
    const { id } = await params

    const fullUser = await db.user.findUnique({ where: { id: user.id }, select: { isVerified: true } })
    if (!fullUser?.isVerified) {
      return NextResponse.json(
        { error: 'Your account must be verified before you can publish ads.' },
        { status: 403 }
      )
    }

    const activeSub = await db.subscription.findFirst({
      where: { userId: user.id, status: 'active', endDate: { gte: new Date() } },
      include: { plan: true },
    })
    const plan = activeSub?.plan ?? { maxListings: 5, maxImages: 5 }

    const maxListings = plan.maxListings === -1 ? Infinity : plan.maxListings
    const userListingCount = await db.listing.count({ where: { userId: user.id, status: { not: 'sold' } } })
    if (userListingCount >= maxListings) {
      return NextResponse.json(
        { error: `You have reached the maximum of ${plan.maxListings} active listings on your current plan. Upgrade to list more.` },
        { status: 403 }
      )
    }

    const original = await db.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        customFields: true,
        listingTags: true,
      },
    })
    if (!original) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (original.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const maxImages = plan.maxImages === -1 ? Infinity : plan.maxImages
    if (original.images.length > maxImages) {
      return NextResponse.json(
        { error: `The original listing has ${original.images.length} images, but your plan only allows ${plan.maxImages}.` },
        { status: 403 }
      )
    }

    const slug = `${original.slug}-copy-${Math.random().toString(36).substring(2, 6)}`
    const displayId = await nextDisplayId(db)
    const created = await db.listing.create({
      data: {
        userId: user.id, title: `${original.title} (Copy)`, slug, displayId,
        description: original.description, price: original.price,
        currency: original.currency, condition: original.condition,
        categoryId: original.categoryId, locationId: original.locationId,
        contactName: original.contactName, contactPhone: original.contactPhone,
        contactEmail: original.contactEmail,
        isNegotiable: original.isNegotiable, status: 'draft',
        customFields: {
          create: original.customFields.map((cf) => ({ name: cf.name, value: cf.value })),
        },
        listingTags: original.listingTags ? {
          create: original.listingTags.map((lt) => ({ tagId: lt.tagId })),
        } : undefined,
        images: {
          create: original.images.map((img) => ({ url: img.url, alt: img.alt, order: img.order })),
        },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        location: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Duplicate error:', error)
    return NextResponse.json({ error: 'Failed to duplicate listing' }, { status: 500 })
  }
}
