'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BrowseLocations() {
  const { locations, listings } = useAppStore()

  const locationData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const l of listings) {
      const slug = l.location.slug
      counts.set(slug, (counts.get(slug) || 0) + 1)
    }
    return locations
      .map(loc => ({ ...loc, count: counts.get(loc.slug) || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [locations, listings])

  if (!locationData.length) return null

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/5">
              <MapPin className="h-5 w-5 text-electric" />
            </div>
            <div>
              <p className="text-xs font-semibold text-electric tracking-wider uppercase">Browse by Location</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy">Find Items Near You</h2>
            </div>
          </div>
          <Link href="/location">
            <Button variant="ghost" size="sm" className="text-royal rounded-xl font-semibold">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {locationData.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/location/${loc.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-navy text-white p-6 block hover:shadow-premium-xl transition-all hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <MapPin className="h-6 w-6 text-electric-light mb-3" />
                <h3 className="font-bold text-lg mb-1">{loc.name}</h3>
                <p className="text-sm text-white/60">{loc.count.toLocaleString()} listing{loc.count !== 1 ? 's' : ''}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
