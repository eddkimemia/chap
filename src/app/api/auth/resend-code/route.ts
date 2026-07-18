import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, generateOTP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { type } = body

    if (!type || !['email', 'phone'].includes(type)) {
      return NextResponse.json({ error: 'Valid type (email or phone) is required' }, { status: 400 })
    }

    const fullUser = await db.user.findUnique({ where: { id: user.id } })
    if (!fullUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (type === 'email' && !fullUser.email) {
      return NextResponse.json({ error: 'No email address on file' }, { status: 400 })
    }
    if (type === 'phone' && !fullUser.phone) {
      return NextResponse.json({ error: 'No phone number on file' }, { status: 400 })
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

    console.log(`[DEV] Verification code for ${fullUser.email || fullUser.phone}: ${code}`)

    return NextResponse.json({
      message: `Code sent to your ${type}`,
      devCode: process.env.NODE_ENV === 'development' ? code : undefined,
    })
  } catch (error) {
    console.error('Resend code error:', error)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}
