'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'

const categoryImage: Record<string, string> = {
  vehicles: 'vehicles.png',
  property: 'property.png',
  electronics: 'electronics.png',
  'phones-tablets': 'phones.png',
  fashion: 'fashion.png',
  jobs: 'jobs.png',
  services: 'service.png',
  agriculture: 'agriculture.png',
  'furniture-home': 'furniture.png',
  'health-beauty': 'health.png',
  'sports-outdoors': 'sports.png',
  'business-industrial': 'business-industrial.png',
  'books-media': 'books.png',
  'pets-animals': 'pets.png',
  'food-drinks': 'foods.png',
  'hobbies-crafts': 'hobbies.png',
  'travel-tourism': 'travel.png',
  'baby-kids': 'baby.png',
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
}

export function CategoryGrid() {
  const { categories } = useAppStore()
  const parentCategories = categories.filter((c) => !c.parentId)

  return (
    <section className="py-12 sm:py-16 relative">
      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-royal tracking-wider uppercase mb-2">Explore</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy">
            Browse by Category
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-3 sm:gap-4"
        >
          {parentCategories.map((cat) => {
            const img = categoryImage[cat.slug]
            const count = cat._count?.listings || 0

            return (
              <motion.div key={cat.id} variants={itemVariants}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="group relative flex flex-col items-center justify-end rounded-2xl overflow-hidden aspect-[4/5] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {img && (
                    <Image
                      src={`/categories/${img}`}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="relative z-10 flex flex-col items-center p-3 sm:p-4 pb-4 sm:pb-5">
                    <p className="text-xs sm:text-sm font-bold text-white text-center leading-tight drop-shadow-sm">
                      {cat.name}
                    </p>
                    {count > 0 && (
                      <span className="mt-1 text-[10px] text-white/70">
                        {count} listing{count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
