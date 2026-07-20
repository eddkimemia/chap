'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  createdAt: string
  category: string
}

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog?status=published&limit=10')
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="text-xs font-semibold text-royal tracking-wider uppercase mb-2">Blog & Guides</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">Buying & Selling Tips</h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-royal rounded-xl font-semibold">
            <Link href="/blog">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </motion.div>
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent -mx-4 px-4 snap-x snap-mandatory">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[320px] shrink-0 snap-start rounded-2xl overflow-hidden border border-slate-100">
                <Skeleton className="aspect-[16/9] w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent -mx-4 px-4 snap-x snap-mandatory">
            {posts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="w-[320px] shrink-0 snap-start"
              >
                <Link href={`/blog/${post.slug}`} className="block group">
                  <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white hover:shadow-premium-lg transition-all hover:-translate-y-1">
                    <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-300 font-bold text-2xl">
                          {post.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                        {post.category && <><span>·</span><span className="text-royal font-medium">{post.category}</span></>}
                      </div>
                      <h3 className="font-bold text-navy text-sm line-clamp-2 group-hover:text-royal transition-colors">{post.title}</h3>
                      {post.excerpt && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{post.excerpt}</p>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
