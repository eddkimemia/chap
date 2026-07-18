import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = request.nextUrl
    const action = searchParams.get('action') || ''
    const entity = searchParams.get('entity') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (action) where.action = action
    if (entity) where.entity = entity

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const userIds = logs.filter((l) => l.userId).map((l) => l.userId)
    const users = userIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: userIds as string[] } },
          select: { id: true, name: true, email: true },
        })
      : []
    const userMap = new Map(users.map((u) => [u.id, u]))

    const enrichedLogs = logs.map((log) => ({
      ...log,
      user: log.userId ? userMap.get(log.userId) || null : null,
    }))

    const total = await db.auditLog.count({ where })
    return NextResponse.json({ logs: enrichedLogs, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
