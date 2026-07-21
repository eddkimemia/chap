import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        isActive: true,
        isSuspended: true,
        suspendedReason: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { listings: true, sessions: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { role, isSuspended, suspendedReason, name, email, phone, username, bio } = body

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (email && email !== user.email) {
      const existing = await db.user.findUnique({ where: { email } })
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
    }
    if (phone && phone !== user.phone) {
      const existing = await db.user.findUnique({ where: { phone } })
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'Phone already in use' }, { status: 409 })
      }
    }
    if (username && username !== user.username) {
      const existing = await db.user.findUnique({ where: { username } })
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'Username already in use' }, { status: 409 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (role !== undefined) updateData.role = role
    if (typeof isSuspended === 'boolean') {
      updateData.isSuspended = isSuspended
      if (isSuspended) updateData.suspendedReason = suspendedReason || null
    }
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email || null
    if (phone !== undefined) updateData.phone = phone || null
    if (username !== undefined) updateData.username = username || null
    if (bio !== undefined) updateData.bio = bio

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        username: true,
        bio: true,
        role: true,
        isActive: true,
        isSuspended: true,
        suspendedReason: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
