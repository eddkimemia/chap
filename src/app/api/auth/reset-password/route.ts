import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  hashPassword,
  destroyAllUserSessions,
  clearSessionCookie,
} from '@/lib/auth'
import { resetPasswordSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`reset-pw:${ip}`, 5, 300)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { token, password, userId } = parsed.data

    const whereClause: Record<string, unknown> = {
      code: token,
      type: 'reset_password',
      used: false,
      expiresAt: { gt: new Date() },
    }
    if (userId) whereClause.userId = userId

    const otp = await db.twoFactorSession.findFirst({
      where: whereClause,
    })

    if (!otp) {
      return NextResponse.json({ error: 'Invalid or expired reset code' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    await db.$transaction([
      db.user.update({ where: { id: otp.userId }, data: { passwordHash } }),
      db.twoFactorSession.update({ where: { id: otp.id }, data: { used: true } }),
    ])

    // Force re-login everywhere after password reset
    await destroyAllUserSessions(otp.userId)

    const response = NextResponse.json({ message: 'Password reset successfully' })
    clearSessionCookie(response)
    return response
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
