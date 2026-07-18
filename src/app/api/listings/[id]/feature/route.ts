import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const newFeatured = !listing.isFeatured
    const featuredUntil = newFeatured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null

    const updated = await db.listing.update({
      where: { id },
      data: { isFeatured: newFeatured, featuredUntil },
    })

    return NextResponse.json({ isFeatured: updated.isFeatured, featuredUntil: updated.featuredUntil })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
