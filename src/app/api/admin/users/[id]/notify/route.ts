import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params
    const { title, body } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const notification = await db.notification.create({
      data: {
        userId: id,
        type: 'system',
        title,
        body,
        data: JSON.stringify({ sentBy: admin.id }),
      },
    })

    await db.moderationLog.create({
      data: {
        userId: admin.id,
        action: 'notification_sent',
        reason: `Admin ${admin.name} sent notification to ${user.name}: ${title}`,
        details: JSON.stringify({ targetUserId: id, notificationId: notification.id }),
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
