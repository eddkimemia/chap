import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const banners = await db.banner.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json(banners)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { title, imageUrl, linkUrl, position, isActive, startDate, endDate, order } = body
    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and imageUrl are required' }, { status: 400 })
    }
    const banner = await db.banner.create({
      data: {
        title, imageUrl, linkUrl: linkUrl || '', position: position || 'home',
        isActive: isActive ?? true, startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null, order: order || 0,
      },
    })
    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}
