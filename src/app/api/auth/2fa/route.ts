import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOTP, hashOtp } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tempToken, method } = body

    if (!tempToken) {
      return NextResponse.json({ error: 'tempToken is required' }, { status: 400 })
    }

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

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, phone: true },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const code = generateOTP()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5)

    await db.twoFactorSession.create({
      data: {
        userId: user.id,
        code: await hashOtp(code),
        type: '2fa',
        expiresAt,
      },
    })

    const maskedDestination = method === 'sms' && user.phone
      ? `*******${user.phone.slice(-4)}`
      : user.email
        ? `***@${user.email.split('@')[1]}`
        : ''

    return NextResponse.json({
      message: `Code sent to your ${method || 'registered device'}`,
      maskedDestination,
      ...(process.env.NODE_ENV === 'development' && { devCode: code }),
    })
  } catch (error) {
    console.error('2FA send error:', error)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}
