import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000)

    const [totalListings, activeListings, totalViews, totalMessages, totalFavorites, totalReviews,
      recentViews, recentMessages, profileViews, totalLeads, dailyViews] = await Promise.all([
      db.listing.count({ where: { userId: user.id } }),
      db.listing.count({ where: { userId: user.id, status: 'active' } }),
      db.listing.aggregate({ where: { userId: user.id }, _sum: { views: true } }),
      db.message.count({ where: { receiverId: user.id } }),
      db.favorite.count({ where: { listing: { userId: user.id } } }),
      db.review.count({ where: { targetId: user.id } }),
      db.listing.aggregate({ where: { userId: user.id, updatedAt: { gte: sevenDaysAgo } }, _sum: { views: true } }),
      db.message.count({ where: { receiverId: user.id, createdAt: { gte: sevenDaysAgo } } }),
      db.userProfile.findUnique({ where: { userId: user.id }, select: { totalViews: true, totalLeads: true } }),
      null, null,
    ])

    const viewsPerDay: { date: string; views: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 86400000)
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
      const dayEnd = new Date(dayStart.getTime() + 86400000)
      const count = await db.message.count({
        where: { receiverId: user.id, createdAt: { gte: dayStart, lt: dayEnd } },
      })
      viewsPerDay.push({ date: dayStart.toISOString().slice(0, 10), views: count })
    }

    return NextResponse.json({
      totalListings,
      activeListings,
      pendingListings: await db.listing.count({ where: { userId: user.id, status: 'pending' } }),
      soldListings: await db.listing.count({ where: { userId: user.id, status: 'sold' } }),
      expiredListings: await db.listing.count({ where: { userId: user.id, status: 'expired' } }),
      totalViews: totalViews._sum?.views || 0,
      recentViews: recentViews._sum?.views || 0,
      totalMessages,
      unreadMessages: await db.message.count({ where: { receiverId: user.id, isRead: false } }),
      recentMessages,
      totalFavorites,
      totalReviews,
      profileViews: profileViews?.totalViews || 0,
      totalLeads: profileViews?.totalLeads || 0,
      totalSales: (await db.sellerStats.findUnique({ where: { userId: user.id } }))?.totalSales || 0,
      avgRating: (await db.sellerStats.findUnique({ where: { userId: user.id } }))?.avgRating || 0,
      viewsPerDay,
      listingViewsByCategory: await db.listing.groupBy({
        by: ['categoryId'],
        where: { userId: user.id },
        _sum: { views: true },
        _count: { id: true },
      }),
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
