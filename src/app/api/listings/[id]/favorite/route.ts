import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: listingId } = await params

    const listing = await db.listing.findUnique({ where: { id: listingId } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const existing = await db.favorite.findUnique({
      where: { userId_listingId: { userId: user.id, listingId } },
    })

    if (existing) {
      await db.favorite.delete({
        where: { userId_listingId: { userId: user.id, listingId } },
      })
      await db.listing.update({
        where: { id: listingId },
        data: { favorites_count: { decrement: 1 } },
      })
      return NextResponse.json({ favorited: false })
    }

    await db.favorite.create({
      data: { userId: user.id, listingId },
    })
    await db.listing.update({
      where: { id: listingId },
      data: { favorites_count: { increment: 1 } },
    })
    return NextResponse.json({ favorited: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error toggling favorite:', error)
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 })
  }
}
