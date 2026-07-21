import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSession, applySessionCookie, generateOTP } from '@/lib/auth'
import { registerSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'
import { normalizeKenyanPhone } from '@/lib/normalize'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`register:${ip}`, 3, 300)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 })
    }

    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, phone, password, username } = parsed.data
    const role = body.role === 'business' ? 'business' : 'user'
    const companyName = role === 'business' ? (body.companyName || name) : undefined
    const industry = role === 'business' ? (body.industry || '') : undefined
    const normalizedPhone = phone ? normalizeKenyanPhone(phone) : null
    const cleanedUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    if (email) {
      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }
    }

    if (normalizedPhone) {
      const existing = await db.user.findUnique({ where: { phone: normalizedPhone } })
      if (existing) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 409 }
        )
      }
    }

    if (cleanedUsername) {
      const existing = await db.user.findUnique({ where: { username: cleanedUsername } })
      if (existing) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        )
      }
    }

    const passwordHash = await hashPassword(password)

    const user = await db.user.create({
      data: {
        name,
        email: email ?? null,
        phone: normalizedPhone,
        passwordHash,
        username: cleanedUsername,
        role,
        ...(role === 'business' ? {
          businessProfile: {
            create: { companyName, industry },
          },
        } : {}),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        username: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    })

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    if (user.email) {
      const code = generateOTP()
      await db.twoFactorSession.create({
        data: { userId: user.id, code, type: 'verify_email', expiresAt },
      })
    }
    if (normalizedPhone) {
      const code = generateOTP()
      await db.twoFactorSession.create({
        data: { userId: user.id, code, type: 'verify_phone', expiresAt },
      })
    }

    const ua = request.headers.get('user-agent') ?? undefined
    const token = await createSession(user.id, ip, ua)

    const response = NextResponse.json({ user }, { status: 201 })
    applySessionCookie(response, token)
    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
