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
    const { duration, paymentId } = body

    if (!duration || !['weekly', 'monthly'].includes(duration)) {
      return NextResponse.json({ error: 'Duration must be weekly or monthly' }, { status: 400 })
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
        type: 'shop',
        amount,
        duration,
        startDate: now,
        endDate,
        status: 'active',
        paymentId,
      },
    })

    await db.user.update({
      where: { id: user.id },
      data: { premiumUntil: endDate },
    })

    await db.notification.create({
      data: {
        userId: user.id,
        type: 'promotion',
        title: 'Shop Promotion Active',
        body: `Your shop is now promoted! Premium visibility ends ${endDate.toLocaleDateString()}.`,
      },
    })

    return NextResponse.json({ success: true, endDate })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Seller promotion error:', error)
    return NextResponse.json({ error: 'Failed to activate promotion' }, { status: 500 })
  }
}
