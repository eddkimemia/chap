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
    const paymentId = body.paymentId || null

    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (amount > 0) {
      if (!paymentId) {
        return NextResponse.json({ error: 'paymentId is required when amount > 0' }, { status: 400 })
      }

      const payment = await db.payment.findUnique({ where: { id: paymentId } })
      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }
      if (payment.userId !== user.id) {
        return NextResponse.json({ error: 'Payment does not belong to this user' }, { status: 403 })
      }
      if (payment.status !== 'completed') {
        return NextResponse.json({ error: 'Payment is not completed' }, { status: 400 })
      }
    }

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

    return NextResponse.json({ success: true, endDate })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Boost error:', error)
    return NextResponse.json({ error: 'Failed to boost listing' }, { status: 500 })
  }
}
