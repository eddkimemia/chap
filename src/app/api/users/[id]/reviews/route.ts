import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { reviewSchema } from '@/lib/validators'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = request.nextUrl

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { targetId: id, isPublic: true },
        include: {
          author: {
            select: { id: true, name: true, avatar: true, isVerified: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.count({ where: { targetId: id, isPublic: true } }),
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (currentUser.id === id) {
      return NextResponse.json(
        { error: 'Cannot review yourself' },
        { status: 400 }
      )
    }

    const existing = await db.review.findFirst({
      where: {
        authorId: currentUser.id,
        targetId: id,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this user' },
        { status: 409 }
      )
    }

    const body = await request.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const review = await db.review.create({
      data: {
        authorId: currentUser.id,
        targetId: id,
        listingId: parsed.data.listingId ?? null,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    const reviewCount = await db.review.count({
      where: { targetId: id },
    })
    const avgRating = await db.review.aggregate({
      where: { targetId: id },
      _avg: { rating: true },
    })

    await db.sellerStats.upsert({
      where: { userId: id },
      update: {
        totalReviews: reviewCount,
        avgRating: avgRating._avg.rating ?? 0,
      },
      create: {
        userId: id,
        totalReviews: reviewCount,
        avgRating: avgRating._avg.rating ?? 0,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
