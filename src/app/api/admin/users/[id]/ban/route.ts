import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, destroyAllUserSessions } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params
    const { isBanned, reason } = await request.json()

    if (typeof isBanned !== 'boolean') {
      return NextResponse.json({ error: 'isBanned is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updated = await db.user.update({
      where: { id },
      data: { isBanned, bannedReason: isBanned ? (reason || null) : null },
      select: { id: true, name: true, isBanned: true, bannedReason: true },
    })

    await db.moderationLog.create({
      data: {
        userId: admin.id,
        action: isBanned ? 'banned' : 'unbanned',
        reason: `Admin ${admin.name} ${isBanned ? 'banned' : 'unbanned'} user ${user.name}${reason ? ': ' + reason : ''}`,
        details: JSON.stringify({ targetUserId: id, reason }),
      },
    })

    if (isBanned) {
      await destroyAllUserSessions(id)
    }

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
