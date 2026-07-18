'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, X, SlidersHorizontal, ArrowUpDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { ListingCard } from '@/components/classifieds/listing-card'
import { apiFetch } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'

interface Listing {
  id: string; slug: string; title: string; description: string; price: number
  currency: string; condition: string; categoryId: string; locationId: string
  isFeatured: boolean; isNegotiable: boolean; views: number; status?: string
  createdAt: string; updatedAt: string; customFields?: string; tags?: string
  category: { id: string; name: string; slug: string; parentId: string | null }
  location: { id: string; name: string; slug: string }
  images: { id: string; url: string; alt: string; order: number }[]
  contactName: string; contactPhone: string; contactEmail: string
  user?: { id: string; name: string; avatar: string; isVerified: boolean }
}

interface SearchParams {
  q: string; category: string; location: string; minPrice: string; maxPrice: string
  condition: string; sort: string; page: string
}

export function SearchPageClient({ initialParams }: { initialParams: SearchParams }) {
  const router = useRouter()
  const { categories, locations } = useAppStore()
  const [accumulated, setAccumulated] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState<SearchParams>(initialParams)
  const [searchInput, setSearchInput] = useState(initialParams.q)
  const lastFilterKey = useRef('')

  const fetchListings = useCallback(async (p: number, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: '20',
        sort: filters.sort,
        ...(filters.q && { search: filters.q }),
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.condition && { condition: filters.condition }),
      })
      const res = await apiFetch(`/api/listings?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (append) {
          setAccumulated(prev => [...prev, ...(data.listings || [])])
        } else {
          setAccumulated(data.listings || [])
        }
        setPagination(data.pagination || { page: 1, total: 0, totalPages: 0 })
      }
    } catch {} finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters.q, filters.category, filters.location, filters.minPrice, filters.maxPrice, filters.condition, filters.sort])

  useEffect(() => {
    fetchListings(parseInt(filters.page), parseInt(filters.page) > 1)
  }, [fetchListings, filters.page])

  useEffect(() => {
    if (!categories.length) {
      apiFetch('/api/categories').then((r) => r.ok && r.json()).then((d) => {
        if (d) useAppStore.getState().setCategories(d)
      })
    }
    if (!locations.length) {
      apiFetch('/api/locations').then((r) => r.ok && r.json()).then((d) => {
        if (d) useAppStore.getState().setLocations(d)
      })
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, q: searchInput, page: '1' }))
    const url = new URL(window.location.href)
    if (searchInput) url.searchParams.set('q', searchInput)
    else url.searchParams.delete('q')
    router.replace(url.pathname + url.search)
  }

  const clearFilters = () => {
    setFilters({ q: '', category: '', location: '', minPrice: '', maxPrice: '', condition: '', sort: 'newest', page: '1' })
    setSearchInput('')
    router.replace('/search')
  }

  const activeFilterCount = [filters.category, filters.location, filters.minPrice, filters.maxPrice, filters.condition].filter(Boolean).length
  const allLoaded = pagination.totalPages > 0 && parseInt(filters.page) >= pagination.totalPages

  return (
    <div className="container mx-auto px-4 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy">
          {filters.q ? `Results for "${filters.q}"` : 'Browse All Listings'}
        </h1>
        <p className="text-muted-foreground mt-1">{pagination.total} listings found</p>
      </div>

      {/* Search bar + mobile filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-11 pl-11 rounded-2xl bg-white border-slate-200"
            />
          </div>
          <Button type="submit" className="rounded-2xl bg-royal text-white border-0">Search</Button>
        </form>

        {/* Desktop sort */}
        <div className="hidden sm:flex items-center gap-2">
          <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v, page: '1' }))}>
            <SelectTrigger className="w-[180px] rounded-2xl h-11 bg-white border-slate-200">
              <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-11 border-slate-200 relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 rounded-full bg-royal text-white text-[10px]">{activeFilterCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="rounded-l-2xl">
              <FiltersPanel filters={filters} setFilters={setFilters} categories={categories} locations={locations} onClear={clearFilters} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile sort + filters (visible on small screens) */}
      <div className="flex sm:hidden gap-2 mb-4">
        <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v, page: '1' }))}>
          <SelectTrigger className="flex-1 rounded-2xl h-11 bg-white border-slate-200">
            <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-2xl h-11 border-slate-200 relative">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 rounded-full bg-royal text-white text-[10px]">{activeFilterCount}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="rounded-l-2xl">
            <FiltersPanel filters={filters} setFilters={setFilters} categories={categories} locations={locations} onClear={clearFilters} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.category && (
            <Badge className="bg-royal/10 text-royal border-royal/20 rounded-lg">
              {categories.find((c) => c.slug === filters.category)?.name || filters.category}
              <button onClick={() => setFilters((f) => ({ ...f, category: '', page: '1' }))} className="ml-1.5"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filters.location && (
            <Badge className="bg-royal/10 text-royal border-royal/20 rounded-lg">
              {locations.find((l) => l.slug === filters.location)?.name || filters.location}
              <button onClick={() => setFilters((f) => ({ ...f, location: '', page: '1' }))} className="ml-1.5"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filters.condition && (
            <Badge className="bg-royal/10 text-royal border-royal/20 rounded-lg">
              {filters.condition}
              <button onClick={() => setFilters((f) => ({ ...f, condition: '', page: '1' }))} className="ml-1.5"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <Badge className="bg-royal/10 text-royal border-royal/20 rounded-lg">
              {filters.minPrice ? `KES ${parseInt(filters.minPrice).toLocaleString()}` : 'Any'} - {filters.maxPrice ? `KES ${parseInt(filters.maxPrice).toLocaleString()}` : 'Any'}
              <button onClick={() => setFilters((f) => ({ ...f, minPrice: '', maxPrice: '', page: '1' }))} className="ml-1.5"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-navy underline">Clear all</button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="rounded-2xl border-0 overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
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
          <p className="text-muted-foreground text-lg">No listings match your criteria</p>
          <Button onClick={clearFilters} className="mt-4 rounded-2xl bg-royal text-white border-0">Clear Filters</Button>
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

function FiltersPanel({
  filters, setFilters, categories, locations, onClear,
}: {
  filters: SearchParams
  setFilters: (f: ((prev: SearchParams) => SearchParams)) => void
  categories: { id: string; name: string; slug: string }[]
  locations: { id: string; name: string; slug: string }[]
  onClear: () => void
}) {
  return (
    <div className="space-y-6 p-4">
      <SheetHeader>
        <SheetTitle>Filters</SheetTitle>
      </SheetHeader>

      <div className="space-y-2">
        <label className="text-sm font-medium text-navy">Category</label>
        <Select value={filters.category} onValueChange={(v) => setFilters((f) => ({ ...f, category: v, page: '1' }))}>
          <SelectTrigger className="rounded-2xl h-11">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-navy">Location</label>
        <Select value={filters.location} onValueChange={(v) => setFilters((f) => ({ ...f, location: v, page: '1' }))}>
          <SelectTrigger className="rounded-2xl h-11">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l.id} value={l.slug}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-navy">Condition</label>
        <Select value={filters.condition} onValueChange={(v) => setFilters((f) => ({ ...f, condition: v, page: '1' }))}>
          <SelectTrigger className="rounded-2xl h-11">
            <SelectValue placeholder="Any Condition" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">Any Condition</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Used">Used</SelectItem>
            <SelectItem value="Refurbished">Refurbished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-navy">Price Range (KES)</label>
        <div className="flex gap-2 items-center">
          <Input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value, page: '1' }))} className="rounded-2xl h-11 bg-white border-slate-200" />
          <span className="text-muted-foreground">-</span>
          <Input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value, page: '1' }))} className="rounded-2xl h-11 bg-white border-slate-200" />
        </div>
      </div>

      <Button onClick={onClear} variant="outline" className="w-full rounded-2xl border-slate-200">
        Clear All Filters
      </Button>
    </div>
  )
}
