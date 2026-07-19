import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    const body = await request.json()
    const type = body.type || 'boost'
    const durationDays = body.durationDays || 7
    const amount = body.amount || 0

    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const now = new Date()
    const endDate = new Date(now.getTime() + durationDays * 86400000)
    let updateData: Record<string, unknown> = {}

    if (type === 'featured') {
      updateData = { isFeatured: true, featuredUntil: endDate }
    } else if (type === 'promote') {
      updateData = { isPromoted: true, promotedUntil: endDate }
    } else {
      updateData = { boostCount: { increment: 1 }, boostUntil: endDate }
    }

    await db.listing.update({ where: { id }, data: updateData as any })
    await db.boost.create({
      data: { listingId: id, userId: user.id, type, amount, startDate: now, endDate, status: 'active' },
    })

    if (amount > 0) {
      await db.payment.create({
        data: {
          userId: user.id,
          amount,
          type: type === 'featured' ? 'featured' : type === 'promote' ? 'promotion' : 'boost',
          provider: 'internal',
          reference: `BOOST-${id}-${Date.now().toString(36)}`,
          status: 'completed',
          metadata: JSON.stringify({ listingId: id, type, durationDays, endDate }),
          description: `${type} listing: ${listing.title}`,
        },
      })
    }

    return NextResponse.json({ success: true, endDate })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Boost error:', error)
    return NextResponse.json({ error: 'Failed to boost listing' }, { status: 500 })
  }
}
