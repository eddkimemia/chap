import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()

    const [
      banners,
      totalUsers,
      totalListings,
      activeListings,
      totalBusinesses,
      activeUsers,
      locationsCount,
      recentReviews,
      settings,
    ] = await Promise.all([
      db.banner.findMany({
        where: {
          isActive: true,
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
        orderBy: { order: 'asc' },
      }),
      db.user.count(),
      db.listing.count(),
      db.listing.count({ where: { status: 'active' } }),
      db.user.count({ where: { role: 'business' } }),
      db.user.count({ where: { lastLoginAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } }),
      db.location.count(),
      db.review.findMany({
        where: { isPublic: true },
        include: { author: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      db.systemSetting.findMany(),
    ])

    const settingsMap: Record<string, unknown> = {}
    for (const s of settings) {
      if (s.type === 'boolean') settingsMap[s.key] = s.value === 'true'
      else if (s.type === 'number') settingsMap[s.key] = Number(s.value)
      else if (s.type === 'json') {
        try { settingsMap[s.key] = JSON.parse(s.value) } catch { settingsMap[s.key] = s.value }
      }
      else settingsMap[s.key] = s.value
    }

    const allLocations = await db.location.findMany({ select: { name: true } })
    const locationNames = allLocations.map(l => l.name)

    return NextResponse.json({
      banners: banners.map(b => ({
        id: b.id,
        title: b.title,
        imageUrl: b.imageUrl,
        linkUrl: b.linkUrl,
      })),
      stats: {
        totalListings,
        activeListings,
        totalUsers,
        totalBusinesses,
        activeUsers30d: activeUsers,
        locations: locationsCount,
        totalTransactions: await db.payment.count({ where: { status: 'completed' } }),
      },
      testimonials: recentReviews.map(r => ({
        id: r.id,
        name: r.author.name,
        avatar: r.author.avatar,
        text: r.comment,
        rating: r.rating,
        role: r.authorId,
      })),
      settings: {
        site_name: settingsMap.site_name || 'ChapKE',
        support_email: settingsMap.support_email || '',
        support_phone: settingsMap.support_phone || '',
        support_hours: settingsMap.support_hours || '',
        address: settingsMap.address || '',
        city: settingsMap.city || '',
        facebook_url: settingsMap.facebook_url || '',
        twitter_url: settingsMap.twitter_url || '',
        instagram_url: settingsMap.instagram_url || '',
        youtube_url: settingsMap.youtube_url || '',
        app_store_url: settingsMap.app_store_url || '',
        play_store_url: settingsMap.play_store_url || '',
        copyright_text: settingsMap.copyright_text || '',
      },
      popularSearchTerms: await getPopularSearchTerms(db),
      locationNames,
    })
  } catch (error) {
    console.error('Home API error:', error)
    return NextResponse.json({ error: 'Failed to fetch home data' }, { status: 500 })
  }
}

async function getPopularSearchTerms(db: any) {
  try {
    const topCategories = await db.listing.groupBy({
      by: ['categoryId'],
      _count: true,
      orderBy: { _count: { id: 'desc' } },
      take: 4,
    })
    if (topCategories.length) {
      const catIds = topCategories.map((c: any) => c.categoryId)
      const cats = await db.category.findMany({
        where: { id: { in: catIds } },
        select: { name: true },
      })
      return cats.map((c: any) => c.name)
    }
  } catch {}
  return []
}
