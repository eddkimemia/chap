import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { maskContact } from '@/lib/mask'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`listing:${ip}`, 120, 60)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await params

    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, isVerified: true },
        },
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        location: {
          select: { id: true, name: true, slug: true },
        },
        images: { orderBy: { order: 'asc' } },
        videos: true,
        documents: true,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    await db.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    const currentUser = await getCurrentUser(request)
    const isOwner = currentUser && currentUser.id === listing.userId

    if (!isOwner) {
      const { contactName, contactPhone, contactEmail, ...publicListing } = listing
      return NextResponse.json({
        ...publicListing,
        views: listing.views + 1,
        contactName: maskContact(contactName),
        contactPhone: maskContact(contactPhone),
        contactEmail: maskContact(contactEmail),
      })
    }

    return NextResponse.json({ ...listing, views: listing.views + 1 })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    const body = await request.json()

    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let tagData: { tagId: string }[] | undefined
    if (body.tags) {
      tagData = await Promise.all(body.tags.map(async (tagName: string) => {
        const tag = await db.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } })
        return { tagId: tag.id }
      }))
    }

    const updated = await db.listing.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        description: body.description ?? undefined,
        price: body.price ?? undefined,
        condition: body.condition ?? undefined,
        status: body.status ?? undefined,
        isNegotiable: body.isNegotiable ?? undefined,
        contactName: body.contactName ?? undefined,
        contactPhone: body.contactPhone ?? undefined,
        contactEmail: body.contactEmail ?? undefined,
        customFields: body.customFields ? {
          deleteMany: {},
          create: Object.entries(body.customFields).map(([name, value]) => ({ name, value: String(value) })),
        } : undefined,
        listingTags: tagData ? {
          deleteMany: {},
          create: tagData,
        } : undefined,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        location: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating listing:', error)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(_request)
    const { id } = await params

    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.listing.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting listing:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
