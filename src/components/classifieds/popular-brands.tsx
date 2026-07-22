'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'

interface Brand {
  name: string
  image: string
}

const defaultBrands: Brand[] = [
  { name: 'Samsung', image: 'samsung.jpg' },
  { name: 'Tecno', image: 'tecno.png' },
  { name: 'Xiaomi', image: 'xiaomi.png' },
  { name: 'Lenovo', image: 'lenovo.jpg' },
  { name: 'HP', image: 'hp.jpeg' },
  { name: 'Acer', image: 'acer.png' },
  { name: 'Itel', image: 'itel.png' },
  { name: 'Oraimo', image: 'oraimo.png' },
]

export function PopularBrands() {
  const { siteSettings } = useAppStore()
  const [brands, setBrands] = useState<Brand[]>(defaultBrands)

  useEffect(() => {
    const brandsJson = siteSettings?.popular_brands
    if (brandsJson) {
      try {
        const parsed = typeof brandsJson === 'string' ? JSON.parse(brandsJson) : brandsJson
        if (Array.isArray(parsed) && parsed.length) setBrands(parsed)
      } catch {}
    }
  }, [siteSettings])

  if (!brands.length) return null

  return (
    <section className="py-16 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-xs font-semibold text-royal tracking-wider uppercase mb-2">Popular Brands</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">Shop by Brand</h2>
        </motion.div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/search?q=${encodeURIComponent(brand.name)}`}
                className="flex items-center justify-center rounded-2xl bg-white border border-slate-100 px-6 py-4 hover:shadow-premium-lg transition-all hover:-translate-y-0.5 w-[130px] h-[64px]"
              >
                <Image
                  src={`/brands/${brand.image}`}
                  alt={brand.name}
                  width={100}
                  height={40}
                  className="object-contain max-h-10"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
