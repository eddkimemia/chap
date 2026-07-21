import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    const body = await request.json()

    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const review = await db.review.findUnique({ where: { id } })
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (review.targetId !== user.id) {
      return NextResponse.json({ error: 'You can only reply to reviews about you' }, { status: 403 })
    }

    const updated = await db.review.update({
      where: { id },
      data: { reply: body.content, replyAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      reply: { content: updated.reply, createdAt: updated.replyAt?.toISOString() },
    })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 })
  }
}
