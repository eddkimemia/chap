import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'
import { ListingCard } from '@/components/classifieds/listing-card'
import { PostAdButton } from '@/components/classifieds/post-ad-button'
import { TrendingUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'All Categories - ChapKE Kenya',
  description: 'Browse all categories on ChapKE Kenya. Find vehicles, property, electronics, jobs, services, and more across Nairobi, Mombasa, Kisumu.',
  openGraph: {
    title: 'All Categories | ChapKE Kenya',
    description: 'Browse all categories on ChapKE Kenya.',
    type: 'website',
    siteName: 'ChapKE',
  },
  alternates: { canonical: 'https://chap.co.ke/category' },
}

const categoryImage: Record<string, string> = {
  vehicles: 'vehicles.png',
  property: 'property.png',
  electronics: 'electronics.png',
  'phones-tablets': 'phones.png',
  fashion: 'fashion.png',
  jobs: 'jobs.png',
  services: 'service.png',
  'agriculture-food': 'agriculture.png',
  'furniture-home': 'furniture.png',
  'health-beauty': 'health.png',
  'sports-outdoors': 'sports.png',
  'business-industrial': 'business-industrial.png',
  'books-media': 'books.png',
  'pets-animals': 'pets.png',
  'food-drinks': 'foods.png',
  'hobbies-arts': 'hobbies.png',
  'travel-tourism': 'travel.png',
  'baby-kids': 'baby.png',
}

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    include: {
      children: { include: { _count: { select: { listings: true } } } },
      _count: { select: { listings: true } },
    },
    orderBy: { order: 'asc' },
  })

  const enriched = categories.map((cat) => {
    const childCount = cat.children.reduce((sum, c) => sum + (c._count?.listings || 0), 0)
    return { ...cat, totalListings: (cat._count?.listings || 0) + childCount }
  })

  const featuredListings = await db.listing.findMany({
    where: { status: 'active' },
    select: {
      id: true, slug: true, title: true, description: true, price: true,
      currency: true, condition: true, isFeatured: true, isPromoted: true,
      isNegotiable: true, views: true, createdAt: true,
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      location: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { order: 'asc' }, take: 1 },
      user: { select: { id: true, name: true, avatar: true, phone: true, isVerified: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 18,
  })

  const shuffledFeatured = [...featuredListings].sort(() => 0.5 - Math.random())

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">

        {/* All Categories Grid */}
        <section className="py-12 bg-slate-50/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-royal tracking-wider uppercase mb-2">Categories</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy">
                Browse by Category
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
              {enriched.map((cat) => {
                const img = categoryImage[cat.slug]
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="group relative flex flex-col items-center justify-end rounded-xl overflow-hidden aspect-[3/4] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {img && (
                      <Image
                        src={`/categories/${img}`}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="relative z-10 flex flex-col items-center p-2 pb-3">
                      <p className="text-[11px] sm:text-xs font-bold text-white text-center leading-tight drop-shadow-sm">
                        {cat.name}
                      </p>
                      {cat.totalListings > 0 && (
                        <span className="mt-0.5 text-[9px] text-white/70">
                          {cat.totalListings} listing{cat.totalListings !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal/5">
                  <TrendingUp className="h-5 w-5 text-royal" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-royal tracking-wider uppercase">Featured</p>
                  <h2 className="text-2xl font-bold text-navy">Featured Listings</h2>
                </div>
              </div>
            </div>
            {featuredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {shuffledFeatured.map((listing) => (
                  <ListingCard key={listing.id} listing={JSON.parse(JSON.stringify(listing)) as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <p className="text-slate-400 text-sm">No featured listings available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-navy">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Can&apos;t find what you&apos;re looking for?</h2>
            <p className="text-white/50 mb-6 max-w-md mx-auto">Try searching across all categories or post your own ad.</p>
            <div className="flex justify-center gap-3">
              <Link href="/search">
                <Button size="lg" className="rounded-2xl bg-white text-navy hover:bg-white/90 border-0 font-semibold px-8">
                  Search All
                </Button>
              </Link>
              <PostAdButton size="lg" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
