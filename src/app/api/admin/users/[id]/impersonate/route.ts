import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, createSession, applySessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params

    if (admin.id === id) {
      return NextResponse.json({ error: 'Cannot impersonate yourself' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const ua = request.headers.get('user-agent') || ''

    const token = await createSession(id, ip, ua)

    await db.moderationLog.create({
      data: {
        userId: admin.id,
        action: 'impersonated',
        reason: `Admin ${admin.name} impersonated user ${user.name} (${user.email || user.phone})`,
        details: JSON.stringify({ targetUserId: id }),
      },
    })

    const response = NextResponse.json({
      message: `Now logged in as ${user.name}`,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    })
    applySessionCookie(response, token)
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
