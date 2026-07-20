import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const [moderationLogs, listings, sessions] = await Promise.all([
      db.moderationLog.findMany({
        where: { OR: [{ userId: id }, { listing: { userId: id } }] },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: { select: { id: true, name: true } },
          listing: { select: { id: true, title: true } },
        },
      }),
      db.listing.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, slug: true, title: true, status: true, price: true, createdAt: true, views: true },
      }),
      db.session.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, ipAddress: true, userAgent: true, isActive: true, createdAt: true, expiresAt: true },
        take: 20,
      }),
    ])

    return NextResponse.json({ moderationLogs, listings, sessions })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
