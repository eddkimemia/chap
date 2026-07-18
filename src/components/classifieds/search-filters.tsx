'use client'

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'

export function SearchFilters() {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    clearFilters,
    categories,
    locations,
    selectedCategory,
    listings,
  } = useAppStore()

  const parentCategories = categories.filter((c) => !c.parentId)
  const hasActiveFilters =
    searchQuery ||
    filters.location ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.condition ||
    selectedCategory

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <section className="border-b border-slate-100 bg-white/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8 py-5">
        {/* Result count */}
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-royal" />
          <span className="text-sm font-semibold text-navy">{listings.length} results</span>
        </div>
        <form onSubmit={handleSearch}>
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-royal/30 focus:ring-royal/10 transition-all text-sm"
                />
              </div>
            </div>

            {/* Category */}
            <div className="w-full sm:w-auto">
              <Select
                value={selectedCategory || 'all'}
                onValueChange={(val) =>
                  useAppStore.setState({
                    selectedCategory: val === 'all' ? null : val,
                    view: val === 'all' ? 'home' : 'listings',
                  })
                }
              >
                <SelectTrigger className="h-11 w-full sm:w-[170px] rounded-xl border-slate-200 bg-slate-50/80 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="w-full sm:w-auto">
              <Select
                value={filters.location || 'all'}
                onValueChange={(val) =>
                  setFilters({ location: val === 'all' ? '' : val })
                }
              >
                <SelectTrigger className="h-11 w-full sm:w-[150px] rounded-xl border-slate-200 bg-slate-50/80 text-sm">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.slug}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Price */}
            <div className="w-full sm:w-[130px]">
              <Input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters({ minPrice: e.target.value })}
                className="h-11 rounded-xl border-slate-200 bg-slate-50/80 text-sm"
                min={0}
              />
            </div>

            {/* Max Price */}
            <div className="w-full sm:w-[130px]">
              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ maxPrice: e.target.value })}
                className="h-11 rounded-xl border-slate-200 bg-slate-50/80 text-sm"
                min={0}
              />
            </div>

            {/* Condition */}
            <div className="w-full sm:w-auto">
              <Select
                value={filters.condition || 'all'}
                onValueChange={(val) =>
                  setFilters({ condition: val === 'all' ? '' : val })
                }
              >
                <SelectTrigger className="h-11 w-full sm:w-[130px] rounded-xl border-slate-200 bg-slate-50/80 text-sm">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-full sm:w-auto">
              <Select value={filters.sort} onValueChange={(val) => setFilters({ sort: val })}>
                <SelectTrigger className="h-11 w-full sm:w-[160px] rounded-xl border-slate-200 bg-slate-50/80 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-11 rounded-xl text-slate-400 hover:text-navy hover:bg-slate-100 font-medium"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
