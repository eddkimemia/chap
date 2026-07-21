import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { blockedUserId } = await request.json()

    if (!blockedUserId) {
      return NextResponse.json({ error: 'blockedUserId is required' }, { status: 400 })
    }

    if (blockedUserId === user.id) {
      return NextResponse.json({ error: 'You cannot block yourself' }, { status: 400 })
    }

    const targetUser = await db.user.findUnique({ where: { id: blockedUserId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existing = await db.blockedUser.findUnique({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: blockedUserId } },
    })

    if (existing) {
      return NextResponse.json({ success: true, message: 'User already blocked' })
    }

    await db.blockedUser.create({
      data: { blockerId: user.id, blockedId: blockedUserId },
    })

    return NextResponse.json({ success: true, message: 'User blocked' })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { blockedUserId } = await request.json()

    if (!blockedUserId) {
      return NextResponse.json({ error: 'blockedUserId is required' }, { status: 400 })
    }

    const existing = await db.blockedUser.findUnique({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: blockedUserId } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    await db.blockedUser.delete({ where: { id: existing.id } })

    return NextResponse.json({ success: true, message: 'User unblocked' })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 })
  }
}
