import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const plans = await db.plan.findMany({
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(plans)
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { name, slug, description, price, currency, interval, features, maxListings, maxImages, maxVideos, isFeatured, isPromoted, isActive, order } = body
    const plan = await db.plan.create({
      data: {
        name, slug, description: description || '', price: price || 0, currency: currency || 'KES', interval: interval || 'monthly',
        features: features || '[]', maxListings: maxListings || 5, maxImages: maxImages || 5, maxVideos: maxVideos || 0,
        isFeatured: isFeatured ?? false, isPromoted: isPromoted ?? false, isActive: isActive ?? true, order: order || 0,
      },
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
