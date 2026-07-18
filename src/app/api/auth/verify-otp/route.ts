import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { generateOTP } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const verifyOtpSchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits'),
  type: z.enum(['phone', 'email']),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`verify-otp:${ip}`, 10, 60)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = verifyOtpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { code, type } = parsed.data
    const userId = user.id

    const otp = await db.twoFactorSession.findFirst({
      where: {
        userId,
        code,
        type: `verify_${type}`,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!otp) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    await db.twoFactorSession.update({
      where: { id: otp.id },
      data: { used: true },
    })

    const updateFields: Record<string, unknown> = {}
    if (type === 'phone') {
      updateFields.isPhoneVerified = true
      updateFields.pendingPhone = null
    } else {
      updateFields.isEmailVerified = true
      updateFields.pendingPhone = null
    }

    const userRecord = await db.user.findUnique({ where: { id: userId } })
    if (type === 'email' && userRecord?.pendingEmail) {
      updateFields.email = userRecord.pendingEmail
      updateFields.pendingEmail = null
    }
    if (type === 'phone' && userRecord?.pendingPhone) {
      updateFields.phone = userRecord.pendingPhone
      updateFields.pendingPhone = null
    }

    await db.user.update({
      where: { id: userId },
      data: updateFields,
    })

    return NextResponse.json({ message: `${type} verified successfully` })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}

async function generateAndStoreOTP(
  userId: string,
  type: 'phone' | 'email'
) {
  const code = generateOTP()
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10)

  await db.twoFactorSession.create({
    data: {
      userId,
      code,
      type: `verify_${type}`,
      expiresAt,
    },
  })

  return code
}
