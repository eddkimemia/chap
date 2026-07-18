import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await db.blogPost.findUnique({ where: { slug } })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment views
    await db.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin(request)
    const { slug } = await params

    const post = await db.blogPost.findUnique({ where: { slug } })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, content, excerpt, coverImage, authorName, category, tags, status, seoTitle, seoDesc } = body

    const updateData: Record<string, unknown> = {}
    if (title) updateData.title = title
    if (content) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (authorName) updateData.authorName = authorName
    if (category !== undefined) updateData.category = category
    if (tags) updateData.tags = JSON.stringify(tags)
    if (status) {
      updateData.status = status
      if (status === 'published' && !post.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle
    if (seoDesc !== undefined) updateData.seoDesc = seoDesc

    // Update slug if title changed
    if (title) {
      let newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      const existing = await db.blogPost.findFirst({
        where: { slug: newSlug, id: { not: post.id } },
      })
      if (existing) newSlug = `${newSlug}-${Date.now()}`
      updateData.slug = newSlug
    }

    const updated = await db.blogPost.update({
      where: { id: post.id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin(request)
    const { slug } = await params

    const post = await db.blogPost.findUnique({ where: { slug } })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await db.blogPost.delete({ where: { id: post.id } })

    return NextResponse.json({ message: 'Post deleted' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
  }
}
