import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'
import { ShopClient } from './client'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const user = await db.user.findFirst({
    where: { username, role: 'business', isActive: true, isSuspended: false },
    select: {
      name: true,
      businessProfile: { select: { companyName: true, description: true, companyLogo: true } },
    },
  })
  if (!user || !user.businessProfile) return { title: 'Shop Not Found - ChapKE' }

  return {
    title: `${user.businessProfile.companyName} - Shop on ChapKE Kenya`,
    description: user.businessProfile.description || `Browse products from ${user.businessProfile.companyName} on ChapKE.`,
    openGraph: {
      title: `${user.businessProfile.companyName} | ChapKE Kenya`,
      description: user.businessProfile.description || `Shop ${user.businessProfile.companyName} on ChapKE.`,
      type: 'profile',
      siteName: 'ChapKE',
    },
    alternates: { canonical: `https://chap.co.ke/shop/${username}` },
  }
}

export default async function ShopPage({ params }: PageProps) {
  const { username } = await params

  const user = await db.user.findFirst({
    where: { username, role: 'business', isActive: true, isSuspended: false },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      isVerified: true,
      phone: true,
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

  if (!user || !user.businessProfile) notFound()

  const [listings, sellerStats, reviews] = await Promise.all([
    db.listing.findMany({
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
          select: { id: true, name: true, avatar: true, isVerified: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.sellerStats.findUnique({ where: { userId: user.id } }),
    db.review.findMany({
      where: { targetId: user.id, isPublic: true },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const listingCount = await db.listing.count({ where: { userId: user.id, status: 'active' } })

  const shuffledListings = [...listings].sort(() => 0.5 - Math.random())

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <ShopClient
          shop={JSON.parse(JSON.stringify({ ...user, businessProfile: user.businessProfile, listingCount }))}
          listings={JSON.parse(JSON.stringify(shuffledListings))}
          sellerStats={JSON.parse(JSON.stringify(sellerStats))}
          reviews={JSON.parse(JSON.stringify(reviews))}
        />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
