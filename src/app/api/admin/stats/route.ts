import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      totalUsers,
      newUsersToday,
      totalListings,
      activeListings,
      totalRevenue,
      totalPayments,
      pendingReports,
      pendingListings,
      totalSubscriptions,
      activeSubscriptions,
      recentPayments,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: todayStart } } }),
      db.listing.count(),
      db.listing.count({ where: { status: 'active' } }),
      db.payment.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
      db.payment.count({ where: { status: 'completed' } }),
      db.report.count({ where: { status: 'pending' } }),
      db.listing.count({ where: { status: 'pending' } }),
      db.subscription.count(),
      db.subscription.count({ where: { status: 'active' } }),
      db.payment.findMany({
        where: { status: 'completed', createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: { amount: true, createdAt: true },
      }),
    ])

    // Build daily revenue for the last 30 days
    const dailyRevenue: Record<string, number> = {}
    for (const p of recentPayments) {
      const day = p.createdAt.toISOString().slice(0, 10)
      dailyRevenue[day] = (dailyRevenue[day] || 0) + p.amount
    }

    return NextResponse.json({
      totalUsers,
      newUsersToday,
      totalListings,
      activeListings,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalPayments,
      pendingReports,
      pendingListings,
      totalSubscriptions,
      activeSubscriptions,
      dailyRevenue,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
