import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const updated = await db.listing.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    })

    if (status !== listing.status) {
      await db.moderationLog.create({
        data: {
          userId: admin.id,
          listingId: id,
          action: status === 'active' ? 'approved' : status === 'suspended' ? 'suspended' : 'manual_review',
          reason: `Status changed from ${listing.status} to ${status}`,
          details: JSON.stringify({ previousStatus: listing.status, newStatus: status }),
        },
      })

      if (status === 'active' || status === 'suspended') {
        await db.notification.create({
          data: {
            userId: listing.userId,
            type: 'system',
            title: status === 'active' ? 'Listing Approved' : 'Listing Suspended',
            body: status === 'active'
              ? `Your listing "${listing.title}" has been approved and is now live.`
              : `Your listing "${listing.title}" has been suspended.`,
            data: JSON.stringify({ listingId: id, slug: listing.slug }),
          },
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
