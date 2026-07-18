'use client'

import { motion } from 'framer-motion'
import {
  Car,
  Home,
  Monitor,
  Smartphone,
  Shirt,
  Briefcase,
  Wrench,
  TreePine,
  Sofa,
  Heart,
  Dumbbell,
  Building2,
  Book,
  Baby,
  PawPrint,
  Utensils,
  Palette,
  Plane,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

const iconMap: Record<string, React.ElementType> = {
  car: Car,
  home: Home,
  monitor: Monitor,
  smartphone: Smartphone,
  shirt: Shirt,
  briefcase: Briefcase,
  wrench: Wrench,
  trees: TreePine,
  sofa: Sofa,
  heart: Heart,
  dumbbell: Dumbbell,
  building: Building2,
  book: Book,
  baby: Baby,
  'paw-print': PawPrint,
  utensils: Utensils,
  palette: Palette,
  plane: Plane,
}

const categoryColors: Record<string, { bg: string; iconColor: string }> = {
  vehicles: { bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  property: { bg: 'bg-amber-100', iconColor: 'text-amber-600' },
  electronics: { bg: 'bg-sky-100', iconColor: 'text-sky-600' },
  'phones-tablets': { bg: 'bg-violet-100', iconColor: 'text-violet-600' },
  fashion: { bg: 'bg-pink-100', iconColor: 'text-pink-600' },
  jobs: { bg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  services: { bg: 'bg-teal-100', iconColor: 'text-teal-600' },
  agriculture: { bg: 'bg-lime-100', iconColor: 'text-lime-600' },
  'furniture-home': { bg: 'bg-orange-100', iconColor: 'text-orange-600' },
  'health-beauty': { bg: 'bg-rose-100', iconColor: 'text-rose-600' },
  'sports-outdoors': { bg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
  'business-industrial': { bg: 'bg-slate-100', iconColor: 'text-slate-600' },
  'books-media': { bg: 'bg-blue-100', iconColor: 'text-blue-600' },
  'baby-kids': { bg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  'pets-animals': { bg: 'bg-stone-100', iconColor: 'text-stone-600' },
  'food-drinks': { bg: 'bg-orange-100', iconColor: 'text-orange-600' },
  'hobbies-crafts': { bg: 'bg-purple-100', iconColor: 'text-purple-600' },
  'travel-tourism': { bg: 'bg-red-100', iconColor: 'text-red-600' },
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
  const { categories, selectedCategory, setSelectedCategory } = useAppStore()
  const parentCategories = categories.filter((c) => !c.parentId)

  const handleClick = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory(null)
    } else {
      setSelectedCategory(slug)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
          className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          {parentCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || Briefcase
            const isActive = selectedCategory === cat.slug
            const color = categoryColors[cat.slug] || { bg: 'bg-royal/10', iconColor: 'text-royal' }
            const count = cat._count?.listings || 0

            return (
              <motion.button
                key={cat.id}
                variants={itemVariants}
                onClick={() => handleClick(cat.slug)}
                className={cn(
                  'group relative flex flex-col items-center gap-3 rounded-2xl p-4 sm:p-5 transition-all duration-300',
                  isActive
                    ? 'bg-royal text-white shadow-xl ring-2 ring-royal/20'
                    : 'bg-white hover:shadow-xl hover:-translate-y-1 border border-slate-100',
                )}
              >
                <div
                  className={cn(
                    'relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl transition-all duration-300',
                    isActive
                      ? 'bg-white/20 text-white'
                      : cn(color.bg, 'group-hover:scale-110')
                  )}
                >
                  <Icon className={cn(
                    'h-6 w-6 sm:h-7 sm:w-7 relative z-10 transition-transform duration-300',
                    isActive ? 'text-white' : cn(color.iconColor, 'group-hover:scale-110')
                  )} />
                  {count > 0 && !isActive && (
                    <span className="absolute -top-1 -right-1 bg-accent-orange text-white text-[9px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold leading-none px-1 shadow-sm">
                      {count}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className={cn(
                    'text-xs sm:text-sm font-semibold leading-tight transition-colors',
                    isActive ? 'text-white' : 'text-navy/80 group-hover:text-navy'
                  )}>
                    {cat.name}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
