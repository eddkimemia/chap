'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronDown, ArrowUpDown, Loader2, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ListingCard } from '@/components/classifieds/listing-card'
import { apiFetch } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'

interface Category {
  id: string; name: string; slug: string; icon?: string; parentId?: string | null
  children?: Category[]
}

interface ListingItem {
  id: string; slug: string; title: string; description: string; price: number
  currency: string; condition: string; categoryId: string; locationId: string
  isFeatured: boolean; isPromoted?: boolean; isNegotiable: boolean; views: number
  status?: string; createdAt: string; updatedAt: string; customFields?: string; tags?: string
  category: { id: string; name: string; slug: string; parentId: string | null }
  location: { id: string; name: string; slug: string }
  images: { id: string; url: string; alt: string; order: number }[]
  user?: { id: string; name: string; avatar: string; isVerified: boolean }
  contactName: string; contactPhone: string; contactEmail: string
}

interface SearchParams {
  search: string; location: string; minPrice: string; maxPrice: string
  condition: string; sort: string; page: string
}

function buildQuery(sp: SearchParams, categorySlug: string): string {
  const p = new URLSearchParams()
  p.set('category', categorySlug)
  if (sp.search) p.set('search', sp.search)
  if (sp.location) p.set('location', sp.location)
  if (sp.minPrice) p.set('minPrice', sp.minPrice)
  if (sp.maxPrice) p.set('maxPrice', sp.maxPrice)
  if (sp.condition) p.set('condition', sp.condition)
  if (sp.sort) p.set('sort', sp.sort)
  if (sp.page) p.set('page', sp.page)
  p.set('limit', '20')
  return p.toString()
}

export function CategoryBrowseClient({
  category, parentCategory, initialSearchParams,
}: {
  category: Category
  parentCategory: Category | null
  initialSearchParams: SearchParams
}) {
  const router = useRouter()
  const { locations } = useAppStore()
  const [accumulated, setAccumulated] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState<SearchParams>(initialSearchParams)
  const [showFilters, setShowFilters] = useState(false)
  const [featuredListings, setFeaturedListings] = useState<ListingItem[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const lastFilterKey = useRef('')

  const fetchListings = useCallback(async (sp: SearchParams, p: number, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true)
    try {
      const pageParams = { ...sp, page: String(p) }
      const res = await apiFetch(`/api/listings?${buildQuery(pageParams, category.slug)}`)
      const data = await res.json()
      if (append) {
        setAccumulated(prev => [...prev, ...(data.listings || [])])
      } else {
        setAccumulated(data.listings || [])
      }
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 0 })
    } catch {
      if (!append) setAccumulated([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category.slug])

  useEffect(() => {
    const p = parseInt(filters.page)
    const fk = JSON.stringify({ search: filters.search, location: filters.location, minPrice: filters.minPrice, maxPrice: filters.maxPrice, condition: filters.condition, sort: filters.sort })
    const append = p > 1 && fk === lastFilterKey.current
    lastFilterKey.current = fk
    fetchListings(filters, p, append)
  }, [fetchListings, filters])

  useEffect(() => {
    const p = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v && k !== 'page') p.set(k, v) })
    router.replace(`/category/${category.slug}?${p.toString()}`, { scroll: false })
  }, [filters, router, category.slug])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await apiFetch(`/api/listings?category=${category.slug}&featured=true&limit=6`)
        if (res.ok) {
          const data = await res.json()
          setFeaturedListings(data.listings || [])
        }
      } catch {} finally {
        setFeaturedLoading(false)
      }
    }
    fetchFeatured()
  }, [category.slug])

  const allLoaded = pagination.totalPages > 0 && parseInt(filters.page) >= pagination.totalPages

  const clearFilters = () => {
    setFilters({ search: '', location: '', minPrice: '', maxPrice: '', condition: '', sort: 'newest', page: '1' })
  }

  const hasActiveFilters = filters.search || filters.location || filters.minPrice || filters.maxPrice || filters.condition

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-royal">Home</Link>
        <span className="mx-2">/</span>
        {parentCategory && (
          <>
            <Link href={`/category/${parentCategory.slug}`} className="hover:text-royal">{parentCategory.name}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-slate-800 font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy">{category.name}</h1>
        <p className="text-sm text-slate-500 mt-1">{pagination.total} classifieds found</p>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link key={child.id} href={`/category/${child.slug}`}>
              <Badge variant="outline" className="rounded-full px-3 py-1.5 text-sm hover:bg-slate-100 hover:text-royal cursor-pointer transition-colors">
                {child.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Featured Listings */}
      {!featuredLoading && featuredListings.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal/5">
              <TrendingUp className="h-4 w-4 text-royal" />
            </div>
            <h2 className="text-lg font-bold text-navy">Featured {category.name}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Search & Sort Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search in this category..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: '1' }))}
            className="pl-9 rounded-2xl border-slate-200 h-11"
          />
        </div>

        <Select
          value={filters.sort}
          onValueChange={(v) => setFilters((f) => ({ ...f, sort: v, page: '1' }))}
        >
          <SelectTrigger className="w-full sm:w-44 rounded-2xl border-slate-200 h-11">
            <ArrowUpDown className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="rounded-2xl h-11 border-slate-200"
          onClick={() => setShowFilters(!showFilters)}
        >
          <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6 border-slate-200 rounded-2xl">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Location</label>
                <Select value={filters.location} onValueChange={(v) => setFilters((f) => ({ ...f, location: v === 'all' ? '' : v, page: '1' }))}>
                  <SelectTrigger className="rounded-2xl border-slate-200">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.slug}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Min Price</label>
                <Input
                  type="number" placeholder="KSh 0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value, page: '1' }))}
                  className="rounded-2xl border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Max Price</label>
                <Input
                  type="number" placeholder="KSh any"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value, page: '1' }))}
                  className="rounded-2xl border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Condition</label>
                <Select value={filters.condition} onValueChange={(v) => setFilters((f) => ({ ...f, condition: v === 'all' ? '' : v, page: '1' }))}>
                  <SelectTrigger className="rounded-2xl border-slate-200">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end mt-3">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-slate-500 hover:text-royal rounded-xl">
                  Clear all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active filter badges */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.search && (
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs gap-1 border-slate-200">
              Search: {filters.search}
              <button onClick={() => setFilters((f) => ({ ...f, search: '', page: '1' }))} className="ml-1 text-slate-400 hover:text-slate-600">&times;</button>
            </Badge>
          )}
          {filters.location && (
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs gap-1 border-slate-200">
              <MapPin className="h-3 w-3" /> {locations.find(l => l.slug === filters.location)?.name || filters.location}
              <button onClick={() => setFilters((f) => ({ ...f, location: '', page: '1' }))} className="ml-1 text-slate-400 hover:text-slate-600">&times;</button>
            </Badge>
          )}
          {filters.minPrice && (
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs gap-1 border-slate-200">
              Min: KSh {Number(filters.minPrice).toLocaleString()}
              <button onClick={() => setFilters((f) => ({ ...f, minPrice: '', page: '1' }))} className="ml-1 text-slate-400 hover:text-slate-600">&times;</button>
            </Badge>
          )}
          {filters.maxPrice && (
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs gap-1 border-slate-200">
              Max: KSh {Number(filters.maxPrice).toLocaleString()}
              <button onClick={() => setFilters((f) => ({ ...f, maxPrice: '', page: '1' }))} className="ml-1 text-slate-400 hover:text-slate-600">&times;</button>
            </Badge>
          )}
          {filters.condition && (
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs gap-1 border-slate-200">
              {filters.condition}
              <button onClick={() => setFilters((f) => ({ ...f, condition: '', page: '1' }))} className="ml-1 text-slate-400 hover:text-slate-600">&times;</button>
            </Badge>
          )}
          <button onClick={clearFilters} className="text-xs text-royal font-medium hover:underline">Clear all</button>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="rounded-2xl border-slate-200 overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </CardContent>
              </Card>
            ))
          : accumulated.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
        }
      </div>

      {!loading && accumulated.length === 0 && (
        <div className="text-center py-16">
          <Star className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">No listings found</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4 rounded-2xl" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Load More */}
      {!loading && !allLoaded && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            className="rounded-2xl px-8 border-slate-200"
            disabled={loadingMore}
            onClick={() => setFilters((f) => ({ ...f, page: String(parseInt(f.page) + 1) }))}
          >
            {loadingMore ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}
