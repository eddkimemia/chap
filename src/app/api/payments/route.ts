import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

function generateReference(): string {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomUUID().slice(0, 8)
  return `PAY-${timestamp}-${random}`
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''

    const where: Record<string, unknown> = { userId: user.id }
    if (status) where.status = status
    if (type) where.type = type

    const payments = await db.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(payments)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { amount, type, provider, metadata, description } = body

    if (!amount || !type || !provider) {
      return NextResponse.json({ error: 'amount, type, and provider are required' }, { status: 400 })
    }

    const validTypes = ['listing_fee', 'subscription', 'boost', 'featured', 'promotion']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: Number(amount),
        type,
        provider,
        reference: generateReference(),
        status: 'pending',
        metadata: metadata ? JSON.stringify(metadata) : '{}',
        description: description || '',
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
