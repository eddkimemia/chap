import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession, applySessionCookie, hashOtp } from '@/lib/auth'
import { twoFactorSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = twoFactorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { code, tempToken } = parsed.data

    const session = await db.twoFactorSession.findFirst({
      where: {
        code: tempToken,
        type: '2fa_session',
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 400 })
    }

    const codeHash = await hashOtp(code)
    const otp = await db.twoFactorSession.findFirst({
      where: {
        userId: session.userId,
        code: codeHash,
        type: '2fa',
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!otp) {
      return NextResponse.json({ error: 'Invalid or expired 2FA code' }, { status: 400 })
    }

    await db.twoFactorSession.update({ where: { id: otp.id }, data: { used: true } })
    await db.twoFactorSession.update({ where: { id: session.id }, data: { used: true } })

    await db.user.update({
      where: { id: session.userId },
      data: { lastLoginAt: new Date() },
    })

    const ip = request.headers.get('x-forwarded-for') ?? undefined
    const ua = request.headers.get('user-agent') ?? undefined
    const token = await createSession(session.userId, ip, ua)

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, phone: true, name: true, avatar: true, role: true, isVerified: true },
    })

    const response = NextResponse.json({ user })
    applySessionCookie(response, token)
    return response
  } catch (error) {
    console.error('2FA verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
