'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Search, MapPin, ChevronDown, ArrowUpDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ListingCard } from '@/components/classifieds/listing-card'
import { apiFetch } from '@/lib/api-client'

interface Category {
  id: string; name: string; slug: string; icon?: string; parentId?: string | null
  children?: Category[]
}

interface Listing {
  id: string; slug: string; title: string; description: string; price: number
  currency: string; condition: string; categoryId: string; locationId: string
  isFeatured: boolean; isNegotiable: boolean; views: number; status?: string
  createdAt: string; updatedAt: string; customFields?: string; tags?: string
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

export function CategoryBrowseClient({
  category, parentCategory, initialSearchParams,
}: {
  category: Category
  parentCategory: Category | null
  initialSearchParams: SearchParams
}) {
  const [accumulated, setAccumulated] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState<SearchParams>(initialSearchParams)
  const lastFilterKey = useRef('')

  const fetchListings = useCallback(async (p: number, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true)
    try {
      const params = new URLSearchParams({
        category: category.slug,
        page: String(p),
        limit: '20',
        sort: filters.sort,
        ...(filters.search && { search: filters.search }),
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
  }, [category.slug, filters.search, filters.location, filters.minPrice, filters.maxPrice, filters.condition, filters.sort])

  useEffect(() => {
    const p = parseInt(filters.page)
    const fk = JSON.stringify({ search: filters.search, location: filters.location, minPrice: filters.minPrice, maxPrice: filters.maxPrice, condition: filters.condition, sort: filters.sort })
    const append = p > 1 && fk === lastFilterKey.current
    lastFilterKey.current = fk
    fetchListings(p, append)
  }, [fetchListings, filters.page])

  const allLoaded = pagination.totalPages > 0 && parseInt(filters.page) >= pagination.totalPages

  return (
    <div className="container mx-auto px-4 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-royal">Home</Link>
        <ChevronDown className="h-3 w-3 -rotate-90" />
        {parentCategory && (
          <>
            <Link href={`/category/${parentCategory.slug}`} className="hover:text-royal">{parentCategory.name}</Link>
            <ChevronDown className="h-3 w-3 -rotate-90" />
          </>
        )}
        <span className="text-navy font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy">{category.name}</h1>
        <p className="text-muted-foreground mt-1">{pagination.total} listings found</p>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-royal/10 text-sm font-medium text-muted-foreground hover:text-royal transition-colors"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); setFilters((f) => ({ ...f, page: '1' })) }} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in this category..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="h-11 pl-11 rounded-2xl bg-white border-slate-200"
            />
          </div>
          <Button type="submit" className="rounded-2xl bg-royal text-white border-0">Search</Button>
        </form>
        <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v, page: '1' }))}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-2xl h-11 bg-white border-slate-200">
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
      </div>

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
          <p className="text-muted-foreground text-lg">No listings found in this category</p>
          <Button asChild className="mt-4 rounded-2xl bg-royal text-white border-0">
            <Link href="/">Browse all listings</Link>
          </Button>
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
