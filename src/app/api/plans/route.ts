import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      orderBy: { order: 'asc' },
      where: { isActive: true },
    })
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()

    const { name, slug, description, price, currency, interval, features, maxListings, maxImages, maxVideos, isFeatured, isPromoted } = body

    if (!name || !slug || price === undefined) {
      return NextResponse.json({ error: 'name, slug, and price are required' }, { status: 400 })
    }

    const existing = await db.plan.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'A plan with this slug already exists' }, { status: 409 })
    }

    const plan = await db.plan.create({
      data: {
        name,
        slug,
        description: description || '',
        price: Number(price),
        currency: currency || 'KES',
        interval: interval || 'monthly',
        planFeatures: features ? { create: (Array.isArray(features) ? features : []).map((f: string) => ({ feature: f })) } : undefined,
        maxListings: maxListings ?? 5,
        maxImages: maxImages ?? 5,
        maxVideos: maxVideos ?? 0,
        isFeatured: isFeatured ?? false,
        isPromoted: isPromoted ?? false,
        isActive: true,
      },
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error creating plan:', error)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
