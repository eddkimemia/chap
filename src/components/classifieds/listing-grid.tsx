'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ListingCard } from './listing-card'
import { useAppStore, type Listing } from '@/lib/store'
import { PackageSearch, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ListingGrid({ listings, title }: { listings: Listing[]; title?: string }) {
  const { isLoading, resetToHome, selectedCategory, searchQuery, view } = useAppStore()

  if (isLoading) {
    return (
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {title && <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-8">{title}</h2>}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-premium">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const isFavorites = view === 'favorites'

  if (!listings.length) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className={isFavorites
              ? 'h-24 w-24 rounded-3xl bg-red-50 flex items-center justify-center mb-6 shadow-lg shadow-red-100/50'
              : 'h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5 shadow-lg'
            }>
              {isFavorites
                ? <Heart className="h-10 w-10 text-red-300" />
                : <PackageSearch className="h-9 w-9 text-slate-300" />
              }
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">
              {isFavorites ? 'No saved items yet' : 'No listings found'}
            </h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md leading-relaxed">
              {isFavorites
                ? 'Tap the heart icon on any listing to save it for later. Your favorites will appear here.'
                : searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : selectedCategory
                    ? 'No listings in this category yet. Be the first to post!'
                    : 'No listings available at the moment. Check back soon!'}
            </p>
            <Button
              variant="outline"
              onClick={resetToHome}
              className="rounded-xl border-slate-200 hover:bg-slate-50 font-semibold"
            >
              {isFavorites ? 'Browse listings' : 'Browse all listings'}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4 lg:px-8">
        {title && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">{title}</h2>
            {!isFavorites && (
              <span className="text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                {listings.length} ad{listings.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {listings.map((listing, index) => (
            <ListingCard key={listing.id} listing={listing} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
