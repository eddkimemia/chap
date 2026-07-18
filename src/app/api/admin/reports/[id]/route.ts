import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const report = await db.report.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        target: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true } },
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json(report)
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
    const { status, resolution } = body

    const report = await db.report.findUnique({ where: { id } })
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
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
