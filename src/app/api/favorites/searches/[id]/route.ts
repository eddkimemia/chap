import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    const search = await db.savedSearch.findFirst({ where: { id, userId: user.id } })
    if (!search) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.savedSearch.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete search' }, { status: 500 })
  }
}
