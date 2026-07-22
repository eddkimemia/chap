import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [promotions, total] = await Promise.all([
      db.sellerPromotion.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, premiumUntil: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.sellerPromotion.count({ where }),
    ])

    return NextResponse.json({ promotions, total, page, limit })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }

    if (!['active', 'expired', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const promotion = await db.sellerPromotion.findUnique({ where: { id } })
    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    const updated = await db.sellerPromotion.update({
      where: { id },
      data: { status },
    })

    if (status === 'cancelled' || status === 'expired') {
      const activeCount = await db.sellerPromotion.count({
        where: { userId: promotion.userId, status: 'active', type: 'shop' },
      })
      if (activeCount === 0) {
        await db.user.update({
          where: { id: promotion.userId },
          data: { premiumUntil: null },
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
