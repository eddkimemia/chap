import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    await db.follow.deleteMany({
      where: { followerId: user.id, followingId: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 })
  }
}
