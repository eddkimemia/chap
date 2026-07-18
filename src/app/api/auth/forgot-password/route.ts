import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOTP } from '@/lib/auth'
import { forgotPasswordSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const identifier = body.email || body.phone || 'unknown'
    const rl = rateLimit(`forgot-pw:${identifier}:${ip}`, 3, 300)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { email, phone } = parsed.data
    const user = email
      ? await db.user.findUnique({ where: { email } })
      : await db.user.findUnique({ where: { phone } })

    if (!user) {
      return NextResponse.json({ message: 'If the account exists, a reset code has been sent' })
    }

    const code = generateOTP()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    await db.twoFactorSession.create({
      data: {
        userId: user.id,
        code,
        type: 'reset_password',
        expiresAt,
      },
    })

    console.log(`[DEV] Password reset code for ${email || phone}: ${code}`)

    return NextResponse.json({
      message: 'If the account exists, a reset code has been sent',
      ...(process.env.NODE_ENV === 'development' && { devCode: code, userId: user.id }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
