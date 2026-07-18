import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { status, resolution } = body

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    const report = await db.report.findUnique({ where: { id } })
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = { status }
    if (resolution !== undefined) updateData.resolution = resolution
    if (status === 'reviewed' || status === 'resolved') {
      updateData.reviewedAt = new Date()
    }

    const updated = await db.report.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        type: true,
        reason: true,
        status: true,
        resolution: true,
        reviewedAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
