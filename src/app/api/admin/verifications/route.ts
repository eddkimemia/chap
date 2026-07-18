import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const verifications = await db.verificationRequest.findMany({
      where: status !== 'all' ? { status } : {},
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, isVerified: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ verifications })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 })
  }
}
