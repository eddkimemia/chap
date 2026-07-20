import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { isVerified, isEmailVerified, isPhoneVerified } = body

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: Record<string, boolean> = {}
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified
    if (typeof isEmailVerified === 'boolean') updateData.isEmailVerified = isEmailVerified
    if (typeof isPhoneVerified === 'boolean') updateData.isPhoneVerified = isPhoneVerified

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, isVerified: true, isEmailVerified: true, isPhoneVerified: true },
    })

    await db.moderationLog.create({
      data: {
        userId: admin.id,
        action: 'user_verified',
        reason: `Admin ${admin.name} updated verification for ${user.name}`,
        details: JSON.stringify(updateData),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
