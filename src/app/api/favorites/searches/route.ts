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

    const mapped = savedSearches.map((s) => {
      let query = {}
      try { query = JSON.parse(s.query) } catch {}
      return {
        id: s.id,
        query: (query as any).search || s.name || '',
        category: (query as any).category || undefined,
        location: (query as any).location || undefined,
        minPrice: (query as any).minPrice || undefined,
        maxPrice: (query as any).maxPrice || undefined,
        alertsEnabled: s.isActive,
        createdAt: s.createdAt.toISOString(),
      }
    })

    return NextResponse.json({ searches: mapped })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch searches' }, { status: 500 })
  }
}
