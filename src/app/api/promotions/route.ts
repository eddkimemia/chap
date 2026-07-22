import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const [promotions, premiumUser] = await Promise.all([
      db.sellerPromotion.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      db.user.findUnique({
        where: { id: user.id },
        select: { premiumUntil: true },
      }),
    ])

    return NextResponse.json({
      promotions,
      premiumUntil: premiumUser?.premiumUntil || null,
      isPremiumSeller: premiumUser?.premiumUntil ? new Date(premiumUser.premiumUntil) > new Date() : false,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}
