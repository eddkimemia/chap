import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, generateOTP } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`send-otp:${ip}`, 5, 60)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body

    if (!type || !['email', 'phone'].includes(type)) {
      return NextResponse.json({ error: 'Valid type (email or phone) is required' }, { status: 400 })
    }

    const fullUser = await db.user.findUnique({ where: { id: user.id } })
    if (!fullUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const destination = type === 'email'
      ? (fullUser.pendingEmail || fullUser.email)
      : (fullUser.pendingPhone || fullUser.phone)

    if (!destination) {
      return NextResponse.json({ error: `No ${type} address on file` }, { status: 400 })
    }

    const code = generateOTP()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    await db.twoFactorSession.create({
      data: {
        userId: user.id,
        code,
        type: `verify_${type}`,
        expiresAt,
      },
    })

    return NextResponse.json({
      message: `Code sent to your ${type}`,
      ...(process.env.NODE_ENV === 'development' && { devCode: code }),
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
