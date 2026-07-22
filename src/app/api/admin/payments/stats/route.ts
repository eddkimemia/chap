import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const now = new Date()
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [totalPayments, completedPayments, monthlyPayments] = await Promise.all([
      db.payment.count(),
      db.payment.findMany({ where: { status: 'completed' } }),
      db.payment.findMany({ where: { status: 'completed', createdAt: { gte: thirtyDaysAgo } } }),
    ])

    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0)

    const totalTransactions = completedPayments.length
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

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
        user: { select: { id: true, name: true, email: true, premiumUntil: true } },
      },
    })

    return NextResponse.json({
      totalPayments,
      totalRevenue,
      monthlyRevenue,
      totalTransactions,
      averageTransaction: Math.round(averageTransaction * 100) / 100,
      byProvider,
      byType,
      recentPayments,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
