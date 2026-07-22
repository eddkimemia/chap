'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Package, Users, Store, MapPin, TrendingUp } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const defaultStats = [
  { label: 'Total Listings', value: 250000, icon: Package, suffix: '+', color: 'text-royal', bg: 'bg-royal/5' },
  { label: 'Registered Users', value: 150000, icon: Users, suffix: '+', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Active Businesses', value: 40000, icon: Store, suffix: '+', color: 'text-accent-red', bg: 'bg-accent-red/5' },
  { label: 'Cities Covered', value: 47, icon: MapPin, suffix: '', color: 'text-electric', bg: 'bg-electric/5' },
  { label: 'Transactions', value: 50000, icon: TrendingUp, suffix: '+', color: 'text-accent-purple', bg: 'bg-accent-purple/5' },
]

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let current = 0
    const increment = Math.ceil(target / 60)
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(current)
    }, 20)
    return () => clearInterval(timer)
  }, [started, target])

  const format = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString()

  return <span ref={ref}>{format(count)}{suffix}</span>
}

export function MarketplaceStats() {
  const { homeStats } = useAppStore()

  const stats = homeStats
    ? [
        { label: 'Total Listings', value: homeStats.totalListings, icon: Package, suffix: '+', color: 'text-royal', bg: 'bg-royal/5' },
        { label: 'Registered Users', value: homeStats.totalUsers, icon: Users, suffix: '+', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Active Businesses', value: homeStats.totalBusinesses, icon: Store, suffix: '+', color: 'text-accent-red', bg: 'bg-accent-red/5' },
        { label: 'Cities Covered', value: homeStats.locations, icon: MapPin, suffix: '', color: 'text-electric', bg: 'bg-electric/5' },
        { label: 'Transactions', value: homeStats.totalTransactions, icon: TrendingUp, suffix: '+', color: 'text-accent-purple', bg: 'bg-accent-purple/5' },
      ]
    : defaultStats

  return (
    <section className="py-20 bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-royal rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent-red rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-royal tracking-wider uppercase mb-2">Our Numbers</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Kenya&apos;s Growing Marketplace</h2>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} mx-auto mb-4`}>
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
