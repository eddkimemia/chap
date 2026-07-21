import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (search) where.OR = [{ title: { contains: search } }, { excerpt: { contains: search } }]

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      db.blogPost.count({ where }),
    ])
    return NextResponse.json({ posts, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Blog error:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { title, slug, content, excerpt, coverImage, authorName, category, tags, status, seoTitle, seoDesc } = body
    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }
    const existing = await db.blogPost.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    const post = await db.blogPost.create({
      data: {
        title, slug, content: content || '', excerpt: excerpt || '', coverImage: coverImage || '',
        authorName: authorName || 'ChapKE Team', category: category || '', tags: tags || '[]',
        status: status || 'draft', seoTitle: seoTitle || '', seoDesc: seoDesc || '',
      },
    })
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
