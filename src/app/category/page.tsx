import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'
import { ListingCard } from '@/components/classifieds/listing-card'
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react'
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
  agriculture: 'agriculture.png',
  'furniture-home': 'furniture.png',
  'health-beauty': 'health.png',
  'sports-outdoors': 'sports.png',
  'business-industrial': 'business-industrial.png',
  'books-media': 'books.png',
  'pets-animals': 'pets.png',
  'food-drinks': 'foods.png',
  'hobbies-crafts': 'hobbies.png',
  'travel-tourism': 'travel.png',
  'baby-kids': 'baby.png',
}

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    include: {
      children: true,
      _count: { select: { listings: true } },
    },
    orderBy: { order: 'asc' },
  })

  const enriched = categories.map((cat) => {
    const childCount = cat.children.reduce((sum, c) => sum + (c as any)._count?.listings || 0, 0)
    return { ...cat, totalListings: (cat._count?.listings || 0) + childCount }
  })

  const featuredListings = await db.listing.findMany({
    where: { isFeatured: true, status: 'active', featuredUntil: { gte: new Date() } },
    select: {
      id: true, slug: true, title: true, description: true, price: true,
      currency: true, condition: true, isFeatured: true, isPromoted: true,
      isNegotiable: true, views: true, createdAt: true,
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      location: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { order: 'asc' }, take: 1 },
      user: { select: { id: true, name: true, avatar: true, isVerified: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
  })

  const popularCategories = [...enriched].sort((a, b) => b.totalListings - a.totalListings).slice(0, 12)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-royal/5 to-white pt-12 pb-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-royal/10 px-4 py-1.5 text-xs font-semibold text-royal mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Explore Categories
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-3">
                Browse All Categories
              </h1>
              <p className="text-slate-500 text-sm sm:text-base">
                Find exactly what you&apos;re looking for across {enriched.length} categories with thousands of listings
              </p>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        {featuredListings.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal/5">
                    <TrendingUp className="h-5 w-5 text-royal" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-royal tracking-wider uppercase">Top picks</p>
                    <h2 className="text-2xl font-bold text-navy">Featured Across Categories</h2>
                  </div>
                </div>
                <Link href="/search?featured=true">
                  <Button variant="ghost" size="sm" className="text-royal hover:text-royal/80 rounded-xl font-semibold">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {featuredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={JSON.parse(JSON.stringify(listing)) as any} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Categories Grid */}
        <section className="py-12 bg-slate-50/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-royal tracking-wider uppercase mb-2">Categories</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy">
                Browse by Category
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {enriched.map((cat) => {
                const img = categoryImage[cat.slug]
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="group relative flex flex-col items-center justify-end rounded-2xl overflow-hidden aspect-[4/5] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
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
                    <div className="relative z-10 flex flex-col items-center p-3 sm:p-4 pb-4 sm:pb-5">
                      <p className="text-xs sm:text-sm font-bold text-white text-center leading-tight drop-shadow-sm">
                        {cat.name}
                      </p>
                      {cat.totalListings > 0 && (
                        <span className="mt-1 text-[10px] text-white/70">
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

        {/* Popular Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orange/5">
                  <Sparkles className="h-5 w-5 text-accent-orange" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-accent-orange tracking-wider uppercase">Trending</p>
                  <h2 className="text-2xl font-bold text-navy">Popular Categories</h2>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularCategories.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-royal/5 text-royal font-bold text-lg">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy group-hover:text-royal transition-colors">{cat.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {cat.totalListings.toLocaleString()} listing{cat.totalListings !== 1 ? 's' : ''}
                      {cat.children.length > 0 && ` · ${cat.children.length} subcategories`}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-royal transition-colors shrink-0" />
                </Link>
              ))}
            </div>
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
              <Link href="/">
                <Button size="lg" className="rounded-2xl bg-accent-orange hover:bg-accent-orange/90 border-0 font-semibold px-8">
                  Post an Ad
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
