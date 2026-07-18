import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const alerts = await db.priceAlert.findMany({
      where: { userId: user.id },
      include: {
        category: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const alert = await db.priceAlert.create({
      data: {
        userId: user.id,
        categoryId: body.categoryId || null,
        locationId: body.locationId || null,
        minPrice: body.minPrice || null,
        maxPrice: body.maxPrice || null,
        isActive: true,
      },
    })

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}
