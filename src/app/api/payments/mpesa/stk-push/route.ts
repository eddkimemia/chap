import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { stkPush, formatPhone } from '@/lib/mpesa'

function generateReference(): string {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomUUID().slice(0, 8)
  return `PAY-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { phone, amount, type, metadata } = body

    if (!phone || !amount || !type) {
      return NextResponse.json({ error: 'phone, amount, and type are required' }, { status: 400 })
    }

    const validTypes = ['listing_fee', 'subscription', 'boost', 'featured', 'promotion']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'amount must be greater than 0' }, { status: 400 })
    }

    const reference = generateReference()
    const userPhone = formatPhone(phone)

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/mpesa/callback`

    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: Number(amount),
        type,
        provider: 'mpesa',
        reference,
        status: 'pending',
        metadata: JSON.stringify(metadata || {}),
        description: body.description || `${type} payment`,
      },
    })

    const result = await stkPush({
      phone: userPhone,
      amount: Number(amount),
      accountReference: reference,
      transactionDesc: body.description || type,
      callbackUrl,
    })

    if (result.ResponseCode !== '0') {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'failed', failedAt: new Date() },
      })
      return NextResponse.json({ error: result.ResponseDescription || 'STK Push failed' }, { status: 400 })
    }

    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'processing',
        metadata: JSON.stringify({
          ...(metadata || {}),
          checkoutRequestID: result.CheckoutRequestID,
          merchantRequestID: result.MerchantRequestID,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      reference,
      checkoutRequestID: result.CheckoutRequestID,
    })
  } catch (error) {
    console.error('M-Pesa STK Push error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
