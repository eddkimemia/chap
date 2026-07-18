import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const now = new Date()
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [
      totalUsers, usersLast30d, newUsers30d,
      totalListings, activeListings, newListings30d,
      totalRevenue, monthlyRevenue,
      totalReports, pendingReports,
      totalConversations, totalMessages,
      categoryStats, locationStats, dailyStats,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
      db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),

      db.listing.count(),
      db.listing.count({ where: { status: 'active' } }),
      db.listing.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),

      db.payment.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
      db.payment.aggregate({ where: { status: 'completed', createdAt: { gte: thirtyDaysAgo } }, _sum: { amount: true } }),

      db.report.count(),
      db.report.count({ where: { status: 'pending' } }),

      db.conversation.count(),
      db.message.count(),

      db.listing.groupBy({ by: ['categoryId'], _count: true, orderBy: { _count: { id: 'desc' } }, take: 10 }),
      db.listing.groupBy({ by: ['locationId'], _count: true, orderBy: { _count: { id: 'desc' } }, take: 10 }),

      db.payment.findMany({
        where: { status: 'completed', createdAt: { gte: sixMonthsAgo } },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    const monthlyRevenueData: Record<string, number> = {}
    for (const p of dailyStats) {
      const key = p.createdAt.toISOString().slice(0, 7)
      monthlyRevenueData[key] = (monthlyRevenueData[key] || 0) + p.amount
    }

    return NextResponse.json({
      users: { total: totalUsers, activeLast30d: usersLast30d, new30d: newUsers30d },
      listings: { total: totalListings, active: activeListings, new30d: newListings30d },
      revenue: { total: totalRevenue._sum.amount || 0, monthly30d: monthlyRevenue._sum.amount || 0, monthlyBreakdown: monthlyRevenueData },
      reports: { total: totalReports, pending: pendingReports },
      messaging: { conversations: totalConversations, messages: totalMessages },
      topCategories: categoryStats,
      topLocations: locationStats,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
