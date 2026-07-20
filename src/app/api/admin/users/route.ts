import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    if (role) where.role = role
    if (status === 'suspended') where.isSuspended = true
    if (status === 'inactive') where.isActive = false

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          username: true,
          role: true,
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
          isSuspended: true,
          isBanned: true,
          bannedReason: true,
          notes: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { listings: true, sessions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()

    const { userId, role, isActive, isSuspended, suspendedReason } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (role) updateData.role = role
    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (typeof isSuspended === 'boolean') {
      updateData.isSuspended = isSuspended
      if (isSuspended) updateData.suspendedReason = suspendedReason || null
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isSuspended: true,
        suspendedReason: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
