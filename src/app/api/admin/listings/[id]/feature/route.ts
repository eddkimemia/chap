import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { isFeatured } = body

    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json({ error: 'isFeatured (boolean) is required' }, { status: 400 })
    }

    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const updated = await db.listing.update({
      where: { id },
      data: { isFeatured },
      select: {
        id: true,
        title: true,
        isFeatured: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
