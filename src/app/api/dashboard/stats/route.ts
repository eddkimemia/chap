import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const [totalListings, activeListings, viewsResult, totalMessages, totalFavorites] = await Promise.all([
      db.listing.count({ where: { userId: user.id } }),
      db.listing.count({ where: { userId: user.id, status: 'active' } }),
      db.listing.aggregate({ where: { userId: user.id }, _sum: { views: true } }),
      db.message.count({ where: { senderId: user.id } }),
      db.favorite.count({ where: { listing: { userId: user.id } } }),
    ])

    return NextResponse.json({
      totalListings,
      activeListings,
      totalViews: viewsResult._sum.views || 0,
      totalMessages,
      totalFavorites,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
