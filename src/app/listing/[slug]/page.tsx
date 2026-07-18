import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { ProductDetailClient } from '@/components/classifieds/product-detail'
import { generateListingSchema, generateBreadcrumbSchema } from '@/lib/seo'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function resolveListing(slug: string) {
  const candidate = slug.includes('-')
    ? await db.listing.findUnique({ where: { slug }, select: { id: true } })
    : null
  if (candidate) return candidate

  const byId = await db.listing.findUnique({ where: { id: slug }, select: { id: true, slug: true } })
  if (byId) return { id: byId.id }

  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resolved = await resolveListing(slug)
  if (!resolved) return { title: 'Listing Not Found - ChapKE' }

  const listing = await db.listing.findUnique({
    where: { id: resolved.id },
    select: {
      title: true, slug: true, description: true, price: true, currency: true,
      images: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 },
      category: { select: { name: true, slug: true } },
      location: { select: { name: true } },
      user: { select: { name: true } },
      condition: true, createdAt: true,
    },
  })
  if (!listing) return { title: 'Listing Not Found - ChapKE' }

  const firstImage = listing.images[0]?.url

  return {
    title: `${listing.title} - ChapKE`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: `${listing.title} | KES ${listing.price.toLocaleString()}`,
      description: listing.description.slice(0, 200),
      images: firstImage ? [{ url: firstImage }] : [],
      type: 'website',
      siteName: 'ChapKE',
      url: `https://chapke.co.ke/listing/${listing.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description: listing.description.slice(0, 200),
      images: firstImage ? [firstImage] : [],
    },
    alternates: { canonical: `https://chapke.co.ke/listing/${listing.slug}` },
  }
}

export default async function ListingPage({ params }: PageProps) {
  const { slug } = await params
  const resolved = await resolveListing(slug)
  if (!resolved) notFound()

  const listing = await db.listing.findUnique({
    where: { id: resolved.id, status: { not: 'archived' } },
    include: {
      user: { select: { id: true, name: true, avatar: true, isVerified: true, createdAt: true, role: true, bio: true } },
      category: { select: { id: true, name: true, slug: true, parentId: true, icon: true } },
      location: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { order: 'asc' } },
      videos: true,
      documents: true,
    },
  })

  if (!listing) notFound()

  // Redirect to canonical slug URL if accessed by ID
  if (slug !== listing.slug) {
    redirect(`/listing/${listing.slug}`)
  }

  await db.listing.update({ where: { id: listing.id }, data: { views: { increment: 1 } } })

  const sellerData = await db.user.findUnique({
    where: { id: listing.userId },
    select: {
      _count: { select: { listings: { where: { status: 'active', id: { not: listing.id } } } } },
      sellerStats: { select: { avgRating: true, totalReviews: true, totalSales: true, responseTime: true, responseRate: true } },
    },
  })

  const sellerListings = await db.listing.findMany({
    where: { userId: listing.userId, status: 'active', id: { not: listing.id } },
    select: { id: true, slug: true, title: true, price: true, currency: true, images: { orderBy: { order: 'asc' }, take: 1 }, createdAt: true, condition: true, location: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  const reviews = await db.review.findMany({
    where: { targetId: listing.userId, isPublic: true },
    include: { author: { select: { id: true, name: true, avatar: true, isVerified: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const similar = await db.listing.findMany({
    where: { categoryId: listing.categoryId, id: { not: listing.id }, status: 'active' },
    select: { id: true, slug: true, title: true, price: true, currency: true, images: { orderBy: { order: 'asc' }, take: 1 }, createdAt: true, condition: true, isFeatured: true, location: { select: { name: true } }, category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })

  const parentCategory = listing.category.parentId
    ? await db.category.findUnique({ where: { id: listing.category.parentId }, select: { id: true, name: true, slug: true } })
    : null

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    ...(parentCategory ? [{ name: parentCategory.name, url: `/category/${parentCategory.slug}` }] : []),
    { name: listing.category.name, url: `/category/${listing.category.slug}` },
    { name: listing.title, url: `/listing/${listing.slug}` },
  ]

  const jsonLd = [
    generateListingSchema({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      images: listing.images,
      category: listing.category,
      location: listing.location,
      user: listing.user,
      createdAt: listing.createdAt.toISOString(),
      condition: listing.condition,
    }),
    generateBreadcrumbSchema(breadcrumbItems),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <ProductDetailClient
            listing={JSON.parse(JSON.stringify({ ...listing, slug: listing.slug }))}
            sellerListings={JSON.parse(JSON.stringify(sellerListings))}
            reviews={JSON.parse(JSON.stringify(reviews))}
            similarListings={JSON.parse(JSON.stringify(similar))}
            sellerStats={sellerData?.sellerStats ? JSON.parse(JSON.stringify(sellerData.sellerStats)) : null}
            breadcrumbItems={breadcrumbItems}
          />
        </main>
        <Footer />
        <MobileNav />
      </div>
    </>
  )
}
