'use client'

import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Car, Building2, Monitor, Smartphone, Shirt, Briefcase, Wrench, TreePine, Sofa, Heart, Dumbbell, ShoppingBag, BookOpen, Baby, PawPrint, UtensilsCrossed, Sparkles, Plane } from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  car: Car, home: Building2, monitor: Monitor, smartphone: Smartphone,
  shirt: Shirt, briefcase: Briefcase, wrench: Wrench, trees: TreePine,
  sofa: Sofa, heart: Heart, dumbbell: Dumbbell, building: Building2,
  bag: ShoppingBag, book: BookOpen, baby: Baby, pet: PawPrint,
  food: UtensilsCrossed, sparkles: Sparkles, plane: Plane,
}

import { cn } from '@/lib/utils'

export function CategoriesBar({ className }: { className?: string }) {
  const { categories } = useAppStore()
  const parentCategories = categories.filter((c) => !c.parentId)

  if (!parentCategories.length) return null

  return (
    <div className={cn('border-b border-slate-100 bg-white', className)}>
      <div className="container mx-auto px-4 lg:px-8 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {parentCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || ShoppingBag
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50/50 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:border-royal/30 hover:bg-royal/5 hover:text-royal transition-colors shrink-0"
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.name}
              </Link>
            )
          })}
          <Link
            href="/search"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-slate-300 bg-transparent px-3.5 py-1.5 text-xs font-medium text-royal hover:border-royal hover:bg-royal/5 transition-colors shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            All Categories
          </Link>
        </div>
      </div>
    </div>
  )
}
