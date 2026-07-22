import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

const PRICES: Record<string, number> = {
  weekly: 200,
  monthly: 500,
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { listingId, duration, paymentId } = body

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 })
    }

    if (!duration || !['weekly', 'monthly'].includes(duration)) {
      return NextResponse.json({ error: 'Duration must be weekly or monthly' }, { status: 400 })
    }

    const listing = await db.listing.findUnique({ where: { id: listingId } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (listing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const amount = PRICES[duration]
    if (!amount) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
    }

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 })
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
    if (payment.amount !== amount) {
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
    }

    const now = new Date()
    const days = duration === 'weekly' ? 7 : 30
    const endDate = new Date(now.getTime() + days * 86400000)

    await db.sellerPromotion.create({
      data: {
        userId: user.id,
        type: 'listing',
        listingId,
        amount,
        duration,
        startDate: now,
        endDate,
        status: 'active',
        paymentId,
      },
    })

    await db.listing.update({
      where: { id: listingId },
      data: { isFeatured: true, featuredUntil: endDate },
    })

    await db.notification.create({
      data: {
        userId: user.id,
        type: 'promotion',
        title: 'Listing Promoted',
        body: `Your listing "${listing.title}" is now promoted until ${endDate.toLocaleDateString()}.`,
        listingId,
      },
    })

    return NextResponse.json({ success: true, endDate })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Listing promotion error:', error)
    return NextResponse.json({ error: 'Failed to promote listing' }, { status: 500 })
  }
}
