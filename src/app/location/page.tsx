import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ChevronRight, Star } from 'lucide-react'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'
import { db } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Browse Locations - ChapKE Kenya',
  description: 'Find listings by location across Kenya. Browse items in Nairobi, Mombasa, Kisumu and all counties.',
  alternates: { canonical: 'https://chap.co.ke/location' },
}

export default async function LocationPage() {
  const [locations, featuredListings] = await Promise.all([
    db.location.findMany({
      where: { parentId: null },
      include: {
        children: { select: { id: true, name: true, slug: true } },
        listings: {
          where: { status: 'active' },
          select: { id: true },
          take: 0,
        },
      },
      orderBy: { name: 'asc' },
    }),
    db.listing.findMany({
      where: { status: 'active' },
      select: {
        id: true, slug: true, title: true, price: true, currency: true,
        isFeatured: true, createdAt: true,
        images: { select: { url: true, alt: true }, take: 1, orderBy: { order: 'asc' } },
        location: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 12,
    }),
  ])

  const locationsWithCounts = await Promise.all(
    locations.map(async (loc) => {
      const count = await db.listing.count({ where: { locationId: loc.id, status: 'active' } })
      const subIds = loc.children.map((c) => c.id)
      const subCounts = subIds.length > 0
        ? await db.listing.groupBy({ by: ['locationId'], where: { locationId: { in: subIds }, status: 'active' }, _count: true })
        : []
      const subCountMap = new Map(subCounts.map((s) => [s.locationId, s._count]))
      return {
        ...loc,
        count,
        children: loc.children.map((c) => ({ ...c, count: subCountMap.get(c.id) || 0 })),
      }
    }),
  )

  const topLocations = locationsWithCounts.sort((a, b) => b.count - a.count).slice(0, 4)

  const topLocationListings = await Promise.all(
    topLocations.map(async (loc) => {
      const listings = await db.listing.findMany({
        where: { locationId: loc.id, status: 'active' },
        select: {
          id: true, slug: true, title: true, price: true, currency: true,
          createdAt: true,
          images: { select: { url: true, alt: true }, take: 1, orderBy: { order: 'asc' } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      })
      return { slug: loc.slug, listings }
    }),
  )
  const topListingMap = new Map(topLocationListings.map((t) => [t.slug, t.listings]))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Featured listings across Kenya */}
        {featuredListings.length > 0 && (
          <section className="py-10 bg-gradient-to-b from-slate-50/50 to-white">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-600 tracking-wider uppercase">Featured</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy">Featured Listings Across Kenya</h2>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {featuredListings.map((listing) => (
                  <Link key={listing.id} href={`/listing/${listing.slug}`} className="group rounded-xl overflow-hidden bg-white border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <div className="relative aspect-[4/3] bg-slate-100">
                      {listing.images[0] ? (
                        <Image src={listing.images[0].url} alt={listing.images[0].alt || listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300 text-sm">No image</div>
                      )}
                      {listing.isFeatured && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-slate-400 mb-0.5">{listing.location.name} &middot; {listing.category.name}</p>
                      <h3 className="text-sm font-semibold text-navy leading-snug line-clamp-2">{listing.title}</h3>
                      <p className="text-sm font-bold text-royal mt-1">KSh {listing.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All locations */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/5">
                <MapPin className="h-5 w-5 text-electric" />
              </div>
              <div>
                <p className="text-xs font-semibold text-electric tracking-wider uppercase">Browse by</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-navy">All Locations</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {locationsWithCounts.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/location/${loc.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy/90 text-white p-6 hover:shadow-premium-xl transition-all hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <MapPin className="h-6 w-6 text-electric-light" />
                      <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h2 className="font-bold text-lg mb-1">{loc.name}</h2>
                    <p className="text-sm text-white/60 mb-3">{loc.count.toLocaleString()} listing{loc.count !== 1 ? 's' : ''}</p>
                    {loc.children.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {loc.children.slice(0, 4).map((child) => (
                          <span key={child.id} className="text-[11px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                            {child.name} {child.count > 0 && `(${child.count})`}
                          </span>
                        ))}
                        {loc.children.length > 4 && (
                          <span className="text-[11px] text-white/40">+{loc.children.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Top locations with listing previews */}
        {topLocations.length > 0 && (
          <section className="py-12 bg-slate-50/50">
            <div className="container mx-auto px-4 lg:px-8">
              <h2 className="text-2xl font-bold text-navy mb-8">Popular Locations</h2>
              <div className="space-y-10">
                {topLocations.map((loc) => {
                  const locListings = topListingMap.get(loc.slug) || []
                  if (!locListings.length) return null
                  return (
                    <div key={loc.id}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-electric" />
                          <h3 className="text-lg font-bold text-navy">{loc.name}</h3>
                          <span className="text-xs text-slate-400">({loc.count} listings)</span>
                        </div>
                        <Link href={`/location/${loc.slug}`} className="text-xs font-semibold text-royal hover:text-royal/80 transition-colors">
                          View all &rarr;
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {locListings.map((listing) => (
                          <Link key={listing.id} href={`/listing/${listing.slug}`} className="group rounded-xl overflow-hidden bg-white border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
                            <div className="relative aspect-[4/3] bg-slate-100">
                              {listing.images[0] ? (
                                <Image src={listing.images[0].url} alt={listing.images[0].alt || listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-300 text-sm">No image</div>
                              )}
                            </div>
                            <div className="p-2.5">
                              <p className="text-[11px] text-slate-400 mb-0.5">{listing.category.name}</p>
                              <h4 className="text-xs font-semibold text-navy leading-snug line-clamp-2">{listing.title}</h4>
                              <p className="text-xs font-bold text-royal mt-1">KSh {listing.price.toLocaleString()}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* SEO text */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="text-xl font-bold text-navy mb-4">Find What You Need Near You</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>ChapKE connects buyers and sellers across all 47 counties in Kenya. Whether you&apos;re looking for a car in Nairobi, a house in Mombasa, or farm equipment in Eldoret, you&apos;ll find the best deals near you.</p>
              <p>Browse listings by location to find items close to home, compare prices across different regions, and connect with sellers in your area.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
