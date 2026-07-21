'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Store, ArrowRight, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

export function PremiumBusinesses() {
  const { listings } = useAppStore()

  const businesses = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar: string | null; isVerified: boolean; username?: string; isPremium: boolean; count: number; location: string; description: string }>()
    for (const l of listings) {
      if (!l.user?.id) continue
      const isPremium = !!(l.isFeatured || l.isPromoted)
      if (!l.user.isVerified && !isPremium) continue
      const existing = map.get(l.user.id)
      if (existing) {
        existing.count++
        if (isPremium) existing.isPremium = true
      } else {
        map.set(l.user.id, {
          id: l.user.id,
          name: l.user.name || 'Unknown',
          avatar: l.user.avatar || null,
          isVerified: l.user.isVerified,
          username: l.user.username,
          isPremium,
          count: 1,
          location: l.location.name,
          description: isPremium ? 'Premium business with featured listings on ChapKE' : 'Trusted seller with verified listings on ChapKE',
        })
      }
    }
    return Array.from(map.values())
      .sort((a, b) => Number(b.isPremium) - Number(a.isPremium) || b.count - a.count)
      .slice(0, 3)
  }, [listings])

  if (!businesses.length) return null

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50/50 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal/5">
              <Store className="h-5 w-5 text-royal" />
            </div>
            <div>
              <p className="text-xs font-semibold text-royal tracking-wider uppercase">Premium Businesses</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy">Trusted Storefronts</h2>
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {businesses.map((biz, i) => (
            <motion.div
              key={biz.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/seller/${biz.username || biz.id}`} className="block group">
                <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden hover:shadow-premium-lg transition-all hover:-translate-y-1">
                  <div className="h-24 bg-gradient-to-r from-royal to-electric relative">
                    <div className="absolute -bottom-8 left-6">
                      <Avatar className="h-16 w-16 ring-4 ring-white">
                        <AvatarImage src={biz.avatar || undefined} />
                        <AvatarFallback className="bg-royal text-white font-bold">{biz.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="pt-10 p-6">
                    <h3 className="font-bold text-navy text-lg">{biz.name} {biz.isPremium && <Badge className="bg-royal text-white border-none text-[9px] px-1.5 py-0 font-semibold ml-1">Premium</Badge>}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-electric" /> {biz.location}
                    </p>
                    <p className="text-sm text-slate-400 mt-3 line-clamp-2">{biz.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="text-xs text-slate-400">{biz.count} listing{biz.count !== 1 ? 's' : ''}</span>
                      <Button size="sm" variant="outline" className="rounded-xl text-[11px] h-8 border-slate-200 font-medium">
                        Visit Store <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
