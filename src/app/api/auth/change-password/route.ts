import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  requireAuth,
  verifyPassword,
  hashPassword,
  destroyAllUserSessions,
  createSession,
  applySessionCookie,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const fullUser = await db.user.findUnique({ where: { id: user.id } })
    if (!fullUser?.passwordHash) {
      return NextResponse.json(
        { error: 'No password set for this account' },
        { status: 400 }
      )
    }

    const valid = await verifyPassword(currentPassword, fullUser.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(newPassword)
    await db.user.update({ where: { id: user.id }, data: { passwordHash } })

    // Invalidate every session, then issue a fresh one for this device
    await destroyAllUserSessions(user.id)

    const ip = request.headers.get('x-forwarded-for') ?? undefined
    const ua = request.headers.get('user-agent') ?? undefined
    const newToken = await createSession(user.id, ip, ua)

    const response = NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
    applySessionCookie(response, newToken)
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json(
      { error: message },
      { status: message === 'Unauthorized' ? 401 : 500 }
    )
  }
}
