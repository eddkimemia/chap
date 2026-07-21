import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface MpesaCallbackItem {
  Name: string
  Value?: string | number
}

interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: MpesaCallbackItem[]
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json() as MpesaCallbackBody
    const callback = raw.Body?.stkCallback

    if (!callback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid callback payload' })
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback

    const payments = await db.payment.findMany({
      where: { provider: 'mpesa', status: 'processing' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const payment = payments.find((p) => {
      try {
        const meta = JSON.parse(p.metadata)
        return meta.checkoutRequestID === CheckoutRequestID
      } catch { return false }
    })

    if (!payment) {
      console.warn(`M-Pesa callback: no pending payment for CheckoutRequestID ${CheckoutRequestID}`)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    if (ResultCode === 0) {
      const meta: Record<string, unknown> = {}
      try { Object.assign(meta, JSON.parse(payment.metadata)) } catch { /* ignore */ }

      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          meta[item.Name] = item.Value
        }
      }

      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          externalId: String(CallbackMetadata?.Item?.find((i) => i.Name === 'MpesaReceiptNumber')?.Value || ''),
          metadata: JSON.stringify(meta),
        },
      })
    } else {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'failed', failedAt: new Date() },
      })
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (error) {
    console.error('M-Pesa callback error:', error)
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Internal error' })
  }
}
