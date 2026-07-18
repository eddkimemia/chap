import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const [totalPayments, completedPayments] = await Promise.all([
      db.payment.count(),
      db.payment.findMany({ where: { status: 'completed' } }),
    ])

    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)

    const byProvider: Record<string, number> = {}
    for (const p of completedPayments) {
      byProvider[p.provider] = (byProvider[p.provider] || 0) + p.amount
    }

    const byType: Record<string, number> = {}
    for (const p of completedPayments) {
      byType[p.type] = (byType[p.type] || 0) + p.amount
    }

    const recentPayments = await db.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        currency: true,
        type: true,
        provider: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      totalPayments,
      totalRevenue,
      byProvider,
      byType,
      recentPayments,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
