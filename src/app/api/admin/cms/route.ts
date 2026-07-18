import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const pages = await db.cmsPage.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(pages)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { title, slug, content, metaTitle, metaDesc, isPublished } = body
    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }
    const existing = await db.cmsPage.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    const page = await db.cmsPage.create({
      data: { title, slug, content: content || '', metaTitle: metaTitle || '', metaDesc: metaDesc || '', isPublished: isPublished ?? true },
    })
    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
