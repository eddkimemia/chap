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
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Plans error:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
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
        maxListings: maxListings || 5, maxImages: maxImages || 5, maxVideos: maxVideos || 0,
        isFeatured: isFeatured ?? false, isPromoted: isPromoted ?? false, isActive: isActive ?? true, order: order || 0,
        planFeatures: features ? { create: (Array.isArray(features) ? features : []).map((f: string) => ({ feature: f })) } : undefined,
      },
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
