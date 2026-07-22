import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

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

/** Known Safaricom production IP ranges for M-Pesa callbacks. */
const SAFARICOM_IPS = new Set([
  '196.201.214.200',
  '196.201.214.206',
  '196.201.213.114',
  '196.201.214.207',
  '196.201.214.208',
  '196.201.213.44',
  '196.201.212.127',
  '196.201.212.138',
  '196.201.212.129',
  '196.201.212.136',
  '196.201.212.74',
  '196.201.212.69',
])

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown'
}

function isAllowedIp(ip: string): boolean {
  if (ip === 'unknown') return false
  if (process.env.MPESA_ALLOWED_IPS) {
    const allowed = process.env.MPESA_ALLOWED_IPS.split(',').map((s) => s.trim())
    return allowed.includes(ip)
  }
  return SAFARICOM_IPS.has(ip)
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)

    if (!isAllowedIp(ip)) {
      console.warn(`M-Pesa callback rejected: untrusted IP ${ip}`)
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Forbidden' }, { status: 403 })
    }

    const rl = rateLimit(`mpesa-callback:${ip}`, 10, 60)
    if (!rl.allowed) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Rate limited' }, { status: 429 })
    }

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
