import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const parentCategories = await db.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            _count: { select: { listings: true } },
          },
        },
        _count: { select: { listings: true } },
      },
      orderBy: { order: 'asc' },
    })

    // Aggregate child counts into parent
    const enriched = parentCategories.map((cat) => {
      const childListingCount = cat.children.reduce(
        (sum, child) => sum + (child._count?.listings || 0),
        0
      )

      return {
        ...cat,
        _count: {
          listings: (cat._count?.listings || 0) + childListingCount,
        },
      }
    })

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}