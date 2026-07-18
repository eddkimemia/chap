import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const following = await db.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: {
            id: true, name: true, avatar: true,
            sellerStats: { select: { avgRating: true, totalReviews: true, totalSales: true } },
            _count: { select: { listings: { where: { status: 'active' } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const sellers = following.map((f) => ({
      id: f.following.id,
      name: f.following.name,
      avatar: f.following.avatar,
      rating: f.following.sellerStats?.avgRating || 0,
      listingsCount: f.following._count.listings,
      joinedAt: '',
    }))

    return NextResponse.json({ sellers })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 })
  }
}
