import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { action } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "approve" or "reject"' }, { status: 400 })
    }

    const profile = await db.businessProfile.findUnique({ where: { id } })
    if (!profile) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })
    }

    const updated = await db.businessProfile.update({
      where: { id },
      data: {
        isVerified: action === 'approve',
        verifiedAt: action === 'approve' ? new Date() : null,
      },
    })

    return NextResponse.json({ businessProfile: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 })
  }
}
