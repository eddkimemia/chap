import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const targetId = searchParams.get('targetId')

    if (!targetId) {
      return NextResponse.json({ error: 'targetId is required' }, { status: 400 })
    }

    const reviews = await db.review.findMany({
      where: { targetId, isPublic: true },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { targetId, listingId, rating, title, comment } = body

    if (!targetId || !rating || !comment) {
      return NextResponse.json(
        { error: 'targetId, rating, and comment are required' },
        { status: 400 }
      )
    }

    if (targetId === user.id) {
      return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const existing = await db.review.findUnique({
      where: {
        authorId_targetId_listingId: {
          authorId: user.id,
          targetId,
          listingId: listingId || null,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this user for this listing' }, { status: 409 })
    }

    const review = await db.review.create({
      data: {
        authorId: user.id,
        targetId,
        listingId: listingId || null,
        rating,
        title: title || '',
        comment,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    })

    const targetReviews = await db.review.aggregate({
      where: { targetId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await db.sellerStats.upsert({
      where: { userId: targetId },
      update: {
        avgRating: targetReviews._avg.rating || 0,
        totalReviews: targetReviews._count.rating,
      },
      create: {
        userId: targetId,
        avgRating: targetReviews._avg.rating || 0,
        totalReviews: targetReviews._count.rating,
      },
    })

    await db.notification.create({
      data: {
        userId: targetId,
        type: 'review',
        title: 'New review',
        body: `${user.name} left you a ${rating}-star review`,
        reviewId: review.id, senderId: user.id,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
