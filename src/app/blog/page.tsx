'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, Tag, ArrowRight, BookOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { timeAgo } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  authorName: string
  category: string
  tags: string
  views: number
  publishedAt: string | null
  createdAt: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog?status=published&limit=20')
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => toast.error('Failed to load blog posts'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy text-white">
      <div className="container mx-auto px-4 lg:px-8 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" />
              ChapKE Blog
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Stories, Guides &amp;{' '}
              <span className="text-electric-light">Market Insights</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed">
              Stay informed with the latest tips, trends, and news from Kenya&apos;s premier marketplace.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-slate-100">
                <Skeleton className="aspect-[16/9] w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <article className="group h-full rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-premium hover:shadow-premium-xl hover:-translate-y-1 transition-all duration-400">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-royal/10">
                          <BookOpen className="h-12 w-12 text-royal/30" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-black/10" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        {post.category && (
                          <Badge variant="secondary" className="text-[10px] font-semibold bg-royal/5 text-royal border-none">
                            <Tag className="h-2.5 w-2.5 mr-1" />
                            {post.category}
                          </Badge>
                        )}
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-navy line-clamp-2 mb-2 group-hover:text-royal transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{post.authorName}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {timeAgo(post.publishedAt || post.createdAt)}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-royal opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-navy mb-2">No Posts Yet</h2>
            <p className="text-slate-500">Check back soon for the latest articles and guides.</p>
          </div>
        )}
      </div>

      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
