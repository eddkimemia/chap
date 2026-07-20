import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession, applySessionCookie } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`admin-login:${email}:${ip}`, 5, 60)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 })
    }

    const user = await db.user.findUnique({ where: { email } })

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.isSuspended) {
      return NextResponse.json({ error: 'Account has been suspended' }, { status: 403 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const ua = request.headers.get('user-agent') ?? undefined
    const token = await createSession(user.id, ip, ua)

    const { passwordHash: _, ...safeUser } = user

    const response = NextResponse.json({ user: safeUser })
    applySessionCookie(response, token)
    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
