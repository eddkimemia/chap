import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(_request)
    const { id } = await params

    const original = await db.listing.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    })
    if (!original) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (original.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const slug = `${original.slug}-copy-${Math.random().toString(36).substring(2, 6)}`
    const created = await db.listing.create({
      data: {
        userId: user.id, title: `${original.title} (Copy)`, slug,
        description: original.description, price: original.price,
        currency: original.currency, condition: original.condition,
        categoryId: original.categoryId, locationId: original.locationId,
        contactName: original.contactName, contactPhone: original.contactPhone,
        contactEmail: original.contactEmail,
        isNegotiable: original.isNegotiable, status: 'draft',
        customFields: original.customFields, tags: original.tags,
        images: {
          create: original.images.map((img) => ({ url: img.url, alt: img.alt, order: img.order })),
        },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        location: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Duplicate error:', error)
    return NextResponse.json({ error: 'Failed to duplicate listing' }, { status: 500 })
  }
}
