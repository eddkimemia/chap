'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Sparkles, ArrowRight, Heart, Clock, MapPin, Package, Users, Eye, Zap, ShoppingBag, ChevronRight, Star, Store, BadgeCheck, ShieldCheck, MessageCircle, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Header } from '@/components/classifieds/header'
import { CategoryGrid } from '@/components/classifieds/category-grid'
import { ListingGrid } from '@/components/classifieds/listing-grid'
import { ListingDetail } from '@/components/classifieds/listing-detail'
import { PostAdDialog } from '@/components/classifieds/post-ad-dialog'
import { SearchFilters } from '@/components/classifieds/search-filters'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'
import { WhyChooseUs } from '@/components/classifieds/why-choose-us'
import { TrendingCategories } from '@/components/classifieds/trending-categories'
import { BrowseLocations } from '@/components/classifieds/browse-locations'
import { TopSellers } from '@/components/classifieds/top-sellers'
import { PremiumBusinesses } from '@/components/classifieds/premium-businesses'
import { PopularBrands } from '@/components/classifieds/popular-brands'
import { MarketplaceStats } from '@/components/classifieds/marketplace-stats'
import { MobileApp } from '@/components/classifieds/mobile-app'
import { Testimonials } from '@/components/classifieds/testimonials'
import { SafetyTips } from '@/components/classifieds/safety-tips'
import { BlogSection } from '@/components/classifieds/blog-section'
import { Newsletter } from '@/components/classifieds/newsletter'
import { RecommendedForYou } from '@/components/classifieds/recommended'

export default function Home() {
  const {
    view,
    searchQuery,
    selectedCategory,
    filters,
    listings,
    featuredListings,
    favorites,
    categories,
    locations,
    setView,
    setSearchQuery,
    setShowPostAd,
    setCategories,
    setLocations,
    setListings,
    setFeaturedListings,
    setIsLoading,
    setSelectedListing,
    loadFavorites,
    currentUser,
    setCurrentUser,
    clearLegacyAuthStorage,
  } = useAppStore()

  useEffect(() => {
    loadFavorites()
    clearLegacyAuthStorage()
    // Restore session from HttpOnly cookie
    if (!currentUser) {
      fetch('/api/auth/me', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.user) setCurrentUser(data.user) })
        .catch(() => { /* not logged in */ })
    }
  }, [loadFavorites, currentUser, setCurrentUser, clearLegacyAuthStorage])

  useEffect(() => {
    async function fetchData() {
      try {
      const [catRes, locRes, listRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/locations'),
          fetch('/api/listings'),
        ])

        if (catRes.ok) {
      const data = await catRes.json()
          setCategories(data)
        }
        if (locRes.ok) {
      const data = await locRes.json()
          setLocations(data)
        }
        if (listRes.ok) {
      const data = await listRes.json()
          const items = Array.isArray(data) ? data : (data.listings ?? [])
          setListings(items)
          setFeaturedListings(items.filter((l: { isFeatured: boolean }) => l.isFeatured))
        }
      } catch { toast.error('Failed to load categories or listings') }
    }
    fetchData()
  }, [setCategories, setLocations, setListings, setFeaturedListings])

  const fetchFiltered = useCallback(async () => {
    if (view === 'detail' || view === 'favorites') return

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (selectedCategory) params.set('category', selectedCategory)
      if (filters.location) params.set('location', filters.location)
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      if (filters.condition) params.set('condition', filters.condition)
      if (filters.sort) params.set('sort', filters.sort)

      const res = await fetch(`/api/listings?${params.toString()}`)
      if (res.ok) {
      const data = await res.json()
        const items = Array.isArray(data) ? data : (data.listings ?? [])
        setListings(items)
      }
    } catch { toast.error('Search failed') } finally {
      setIsLoading(false)
    }
  }, [view, searchQuery, selectedCategory, filters, setListings, setIsLoading])

  useEffect(() => {
    if (view === 'listings') {
      const timer = setTimeout(fetchFiltered, 300)
      return () => clearTimeout(timer)
    }
  }, [view, fetchFiltered])

  const filteredListings = useMemo(() => {
    if (view !== 'listings') return []
    return listings
  }, [view, listings])

  const favoriteListings = useMemo(() => {
    if (view !== 'favorites') return []
    return listings.filter((l) => favorites.includes(l.id))
  }, [view, listings, favorites])

  const homeFeatured = useMemo(() => {
    if (view !== 'home') return []
    return featuredListings.length > 0 ? featuredListings : listings.slice(0, 6)
  }, [view, featuredListings, listings])

  const homeLatest = useMemo(() => {
    if (view !== 'home') return []
    const sorted = [...listings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    const featuredIds = new Set(featuredListings.map((l) => l.id))
    const nonFeatured = sorted.filter((l) => !featuredIds.has(l.id))
    return nonFeatured.slice(0, 8)
  }, [view, listings, featuredListings])

  const trendingLocations = useMemo(() => {
    if (view !== 'home') return []
    const locMap = new Map<string, { name: string; slug: string; count: number }>()
    listings.forEach((l) => {
      const existing = locMap.get(l.location.slug)
      if (existing) {
        existing.count++
      } else {
        locMap.set(l.location.slug, { name: l.location.name, slug: l.location.slug, count: 0 })
        locMap.get(l.location.slug)!.count = 1
      }
    })
    return Array.from(locMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [view, listings])

  const [recentlyViewed, setRecentlyViewed] = useState<import('@/lib/store').Listing[]>([])
  useEffect(() => {
    try {
      const stored = localStorage.getItem('chapke_recent')
      if (!stored) return
      const ids: string[] = JSON.parse(stored)
      const items = ids
        .map((id) => listings.find((l) => l.id === id))
        .filter(Boolean) as import('@/lib/store').Listing[]
      setRecentlyViewed(items)
    } catch { /* localStorage read-only, silently ignore */ }
  }, [listings])

  const heroImages = ['/uploads/hero1.jpg', '/uploads/hero2.jpg', '/uploads/hero3.jpg', '/uploads/hero4.jpg']
  const [heroBg, setHeroBg] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setHeroBg((p) => (p + 1) % heroImages.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setView('listings')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-16 sm:pb-0">
        {view === 'detail' && <ListingDetail />}

        {view === 'listings' && (
          <>
            <SearchFilters />
            <ListingGrid listings={filteredListings} title="Search Results" />
          </>
        )}

        {view === 'favorites' && (
          <ListingGrid
            listings={favoriteListings}
            title={
              favoriteListings.length > 0
                ? `Saved Items (${favoriteListings.length})`
                : 'Saved Items'
            }
          />
        )}

        {view === 'home' && (
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-navy">
              {/* Background slideshow */}
              <div className="absolute inset-0">
                {heroImages.map((src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    fill
                    className={`object-cover transition-opacity duration-1000 ${i === heroBg ? 'opacity-100' : 'opacity-0'}`}
                    priority={i === 0}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/30" />
              </div>
              <div className="container mx-auto px-4 lg:px-8 py-16 sm:py-20 lg:py-28 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                      className="mb-6 inline-flex items-center gap-2 rounded-full border border-royal/10 bg-white/60 backdrop-blur-sm px-5 py-2 text-sm font-semibold text-royal shadow-sm"
                    >
                      <Sparkles className="h-4 w-4 text-accent-orange" />
                      Kenya&apos;s Premier Digital Marketplace
                    </motion.div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-balance text-white leading-[1.1]">
                      Find the best deals{' '}
                      <span className="relative inline-block">
                        <span className="bg-royal bg-clip-text text-transparent">
                          across Kenya
                        </span>
                        <motion.span
                          className="absolute -bottom-1 left-0 h-1.5 bg-royal rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ delay: 0.9, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                        />
                      </span>
                    </h1>

                    <p className="text-slate-200 text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
                      Buy and sell vehicles, property, electronics, and more.
                      Powered by cutting-edge technology for a seamless experience.
                    </p>

                    <form onSubmit={handleHeroSearch}>
                      <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                        <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                          <Input
                            type="search"
                            placeholder="What are you looking for?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 pl-12 text-base rounded-2xl border-slate-200 bg-white shadow-premium-lg focus:border-royal/30 focus:ring-royal/10 transition-all"
                          />
                        </div>
                        <Button
                          type="submit"
                          size="lg"
                          className="h-14 px-8 rounded-2xl font-bold bg-royal shadow-xl shadow-royal/25 hover:shadow-royal/35 transition-all border-0 text-base"
                        >
                          <Search className="h-5 w-5 mr-2" /> Search
                        </Button>
                      </div>
                    </form>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6">
                      <span className="text-sm text-slate-300 font-medium">Popular:</span>
                      {['Toyota Corolla', 'iPhone 15', 'Land Nairobi', 'MacBook'].map(
                        (term) => (
                          <button
                            key={term}
                            onClick={() => {
                              setSearchQuery(term === 'Land Nairobi' ? 'Land in Nairobi' : term)
                              setView('listings')
                            }}
                            className="inline-flex items-center rounded-full border border-white/20 bg-white/15 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/25 hover:border-white/30 hover:text-white transition-all shadow-sm"
                          >
                            {term}
                          </button>
                        )
                      )}
                    </div>
                  </motion.div>

                  

                  {/* Right: Stats cards */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="hidden lg:block"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Active Listings', value: `${listings.length || 0}+`, icon: Package, color: 'text-royal', bg: 'bg-royal/5' },
                        { label: 'Categories', value: `${categories.filter(c => !c.parentId).length || 0}+`, icon: Sparkles, color: 'text-accent-orange', bg: 'bg-accent-orange/5' },
                        { label: 'Locations', value: `${locations.length || 0}+`, icon: MapPin, color: 'text-electric', bg: 'bg-electric/5' },
                        { label: 'Active Sellers', value: '5K+', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/90 backdrop-blur-sm p-3 shadow-premium hover:shadow-premium-lg transition-all"
                        >
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          </div>
                          <div>
                            <span className="text-base font-bold text-navy leading-tight block">{stat.value}</span>
                            <span className="text-[11px] text-slate-400 font-medium">{stat.label}</span>
                          </div>
                        </motion.div>
                      ))}
                      {/* Floating card */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="col-span-2 rounded-xl bg-gradient-to-r from-royal to-electric p-3 shadow-xl"
                      >
                        <div className="flex items-center gap-3 text-white">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                            <BadgeCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-base font-bold">250K+ Listings</p>
                            <p className="text-xs text-white/70">40K Sellers &bull; 200 Categories</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

             {/* Featured Listings */}
            {homeFeatured.length > 0 && (
              <section className="py-12">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal/5">
                        <TrendingUp className="h-5 w-5 text-royal" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-royal tracking-wider uppercase">Top picks</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-navy">Featured Listings</h2>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-royal hover:text-royal/80 rounded-xl font-semibold" onClick={() => { useAppStore.setState({ view: 'listings' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <ListingGrid listings={homeFeatured} />
                </div>
              </section>
            )}

            {/* Categories */}
            <CategoryGrid />

             {/* Why Choose Us */}
            <WhyChooseUs />

            {/* Latest Listings */}
            {homeLatest.length > 0 && (
              <section className="py-12 bg-slate-50/50">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/5">
                        <Clock className="h-5 w-5 text-accent-purple" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-accent-purple tracking-wider uppercase">Fresh arrivals</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-navy">Latest Listings</h2>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-royal hover:text-royal/80 rounded-xl font-semibold" onClick={() => { useAppStore.setState({ view: 'listings' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <ListingGrid listings={homeLatest} />
                </div>
              </section>
            )}

            {/* Browse by Location */}
            <BrowseLocations />

            {/* Top Sellers */}
            <TopSellers />

            {/* Premium Businesses */}
            <PremiumBusinesses />

            {/* Popular Brands */}
            <PopularBrands />

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && view === 'home' && (
              <section className="py-12">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <Clock className="h-5 w-5 text-slate-400" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-navy">Recently Viewed</h2>
                    </div>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-navy rounded-xl font-medium" onClick={() => { if (typeof window !== 'undefined') { localStorage.removeItem('chapke_recent'); useAppStore.setState({ view: 'home' }) } }}>
                      Clear
                    </Button>
                  </div>
                  <ListingGrid listings={recentlyViewed} />
                </div>
              </section>
            )}

            {/* Recommended For You */}
            <RecommendedForYou />

            {/* Marketplace Stats */}
            <MarketplaceStats />

            {/* Safety Tips */}
            <SafetyTips />

            {/* Testimonials */}
            <Testimonials />

            {/* Blog Section */}
            <BlogSection />

            {/* Mobile App */}
            <MobileApp />

            {/* Newsletter */}
            <Newsletter />

            {/* CTA Section */}
            <section className="relative py-20 overflow-hidden bg-navy">
              <div className="container relative mx-auto px-4 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mx-auto max-w-lg text-center"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-2 text-sm font-semibold text-white/90 mb-6">
                    <Heart className="h-4 w-4 text-accent-orange" />
                    Join thousands of Kenyan buyers &amp; sellers
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Have something to sell?</h2>
                  <p className="text-white/50 mb-8 text-lg leading-relaxed">
                    Post your ad for free and reach thousands of buyers across Kenya. It only takes a minute!
                  </p>
                  <Button size="lg" className="h-14 px-10 text-base font-bold rounded-2xl bg-accent-orange shadow-xl shadow-accent-orange/25 hover:shadow-accent-orange/35 transition-all border-0" onClick={() => setShowPostAd(true)}>
                    Post Your Ad — It&apos;s Free!
                  </Button>
                </motion.div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
      <MobileNav />
      <PostAdDialog />
    </div>
  )
}
