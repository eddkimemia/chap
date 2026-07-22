import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const subscriptions = await db.subscription.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { planId, paymentId } = body

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 })
    }

    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (plan.price > 0) {
      if (!paymentId) {
        return NextResponse.json({ error: 'paymentId is required for paid plans' }, { status: 400 })
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
      if (payment.type !== 'subscription') {
        return NextResponse.json({ error: 'Payment type must be subscription' }, { status: 400 })
      }
    }

    const startDate = new Date()
    const endDate = new Date()
    if (plan.interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    const subscription = await db.subscription.create({
      data: {
        userId: user.id,
        planId,
        status: 'active',
        startDate,
        endDate,
        autoRenew: true,
        paymentId: paymentId || null,
      },
      include: { plan: true },
    })

    if (plan.isFeatured || plan.isPromoted) {
      await db.listing.updateMany({
        where: { userId: user.id, status: 'active' },
        data: {
          isFeatured: plan.isFeatured || false,
          isPromoted: plan.isPromoted || false,
          featuredUntil: plan.isFeatured ? endDate : null,
          promotedUntil: plan.isPromoted ? endDate : null,
        },
      })
    }

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
