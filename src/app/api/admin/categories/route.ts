import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const categories = await db.category.findMany({
      include: {
        _count: { select: { listings: true } },
        parent: { select: { id: true, name: true } },
      },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { name, slug, icon, image, parentId, order, isActive, seoTitle, seoDesc } = body
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }
    const existing = await db.category.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    const category = await db.category.create({
      data: { name, slug, icon: icon || '', image: image || '', parentId: parentId || null, order: order || 0, isActive: isActive ?? true, seoTitle: seoTitle || '', seoDesc: seoDesc || '' },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 })
  }
}
