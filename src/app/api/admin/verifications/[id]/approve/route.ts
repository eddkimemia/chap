import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { status, reviewNote } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 })
    }

    const request_ = await db.verificationRequest.findUnique({ where: { id } })
    if (!request_) return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })

    const updated = await db.verificationRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: admin.id,
        reviewNote: reviewNote || '',
        reviewedAt: new Date(),
      },
    })

    if (status === 'approved') {
      await db.user.update({
        where: { id: request_.userId },
        data: { isVerified: true },
      })
    }

    return NextResponse.json({ verification: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Verification review error:', error)
    return NextResponse.json({ error: 'Failed to review verification' }, { status: 500 })
  }
}
