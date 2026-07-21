import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = request.nextUrl

    const status = searchParams.get('status') || 'active'
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const featured = searchParams.get('featured') === 'true'

    const where: Record<string, unknown> = {
      userId: id,
    }

    if (status !== 'all') {
      where.status = status
    }

    if (featured) {
      where.isFeatured = true
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' }
    if (sort === 'price-asc') orderBy = { price: 'asc' }
    if (sort === 'price-desc') orderBy = { price: 'desc' }
    if (sort === 'popular') orderBy = { views: 'desc' }

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          location: { select: { id: true, name: true, slug: true } },
          images: { select: { id: true, url: true }, orderBy: { order: 'asc' }, take: 1 },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.listing.count({ where }),
    ])

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get user listings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}
