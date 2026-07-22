import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const user = await db.user.findFirst({
      where: { username, role: 'business', isActive: true, isSuspended: false },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
        businessProfile: {
          select: {
            companyName: true,
            companyLogo: true,
            companyBanner: true,
            description: true,
            industry: true,
            isVerified: true,
            website: true,
            employeeCount: true,
            foundedYear: true,
            address: true,
            socialLinks: true,
          },
        },
      },
    })

    if (!user || !user.businessProfile) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    const listings = await db.listing.findMany({
      where: { userId: user.id, status: 'active' },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        currency: true,
        condition: true,
        isFeatured: true,
        isNegotiable: true,
        views: true,
        createdAt: true,
        location: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        images: { select: { url: true, alt: true }, take: 1, orderBy: { order: 'asc' } },
        user: {
          select: { id: true, name: true, avatar: true, isVerified: true, username: true, premiumUntil: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const listingCount = await db.listing.count({ where: { userId: user.id, status: 'active' } })
    const shuffled = [...listings].sort(() => 0.5 - Math.random())

    return NextResponse.json({
      shop: {
        ...user,
        businessProfile: user.businessProfile,
        listingCount,
      },
      listings: shuffled,
    })
  } catch (error) {
    console.error('Error fetching shop:', error)
    return NextResponse.json({ error: 'Failed to fetch shop' }, { status: 500 })
  }
}
