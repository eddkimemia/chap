'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Sparkles } from 'lucide-react'
import { ListingCard } from './listing-card'

export function PremiumSellers() {
  const { listings } = useAppStore()

  const premiumListings = useMemo(() => {
    return listings
      .filter(l => l.user?.premiumUntil && new Date(l.user.premiumUntil) > new Date())
      .slice(0, 8)
  }, [listings])

  if (!premiumListings.length) return null

  return (
    <section className="py-12 bg-gradient-to-b from-slate-50/50 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal/5">
              <Sparkles className="h-5 w-5 text-royal" />
            </div>
            <div>
              <p className="text-xs font-semibold text-royal tracking-wider uppercase">Premium</p>
              <h2 className="text-2xl font-bold text-navy">Premium Listings</h2>
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {premiumListings.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
