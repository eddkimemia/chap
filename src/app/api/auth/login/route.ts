import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession, applySessionCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const identifier = body.email || body.phone || 'unknown'
    const rl = rateLimit(`login:${identifier}:${ip}`, 5, 60)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 })
    }
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, phone, password } = parsed.data

    let user
    if (email) {
      user = await db.user.findUnique({ where: { email } })
    } else if (phone) {
      user = await db.user.findUnique({ where: { phone } })
    } else {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      )
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'Account has been suspended' },
        { status: 403 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      )
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const ua = request.headers.get('user-agent') ?? undefined
    const token = await createSession(user.id, ip, ua)

    const { passwordHash: _, ...safeUser } = user

    // Token is only in HttpOnly cookie — not returned in JSON body
    const response = NextResponse.json({ user: safeUser })
    applySessionCookie(response, token)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
