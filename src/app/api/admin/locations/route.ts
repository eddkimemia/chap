import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const locations = await db.location.findMany({
      include: {
        _count: { select: { listings: true } },
        parent: { select: { id: true, name: true } },
      },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(locations)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { name, slug, parentId, latitude, longitude, level, order, isActive } = body
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }
    const existing = await db.location.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    const location = await db.location.create({
      data: { name, slug, parentId: parentId || null, latitude: latitude || null, longitude: longitude || null, level: level ?? 0, order: order || 0, isActive: isActive ?? true },
    })
    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 })
  }
}
