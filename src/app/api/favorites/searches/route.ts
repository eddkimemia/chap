import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const savedSearches = await db.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    const mapped = savedSearches.map((s) => ({
      id: s.id,
      query: s.search || s.name || '',
      category: s.categoryId || undefined,
      location: s.locationId || undefined,
      minPrice: s.minPrice || undefined,
      maxPrice: s.maxPrice || undefined,
      alertsEnabled: s.isActive,
      createdAt: s.createdAt.toISOString(),
    }))

    return NextResponse.json({ searches: mapped })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch searches' }, { status: 500 })
  }
}
