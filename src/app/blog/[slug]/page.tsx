'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Calendar, Eye, Tag, ArrowLeft, BookOpen, User } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  content: string
  excerpt: string
  coverImage: string
  authorName: string
  category: string
  tags: string
  views: number
  publishedAt: string | null
  createdAt: string
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [related, setRelated] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      fetch(`/api/blog/${slug}`).then((r) => r.json()),
      fetch('/api/blog?status=published&limit=4').then((r) => r.json()),
    ])
      .then(([postData, listData]) => {
        setPost(postData)
      const all = listData.posts || []
        setRelated(all.filter((p: BlogPost) => p.slug !== slug).slice(0, 3))
      })
      .catch(() => toast.error('Failed to load post'))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        {loading ? (
          <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
            <Skeleton className="h-6 w-32 mb-8" />
            <Skeleton className="aspect-[2/1] w-full rounded-2xl mb-8" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-8 w-1/2 mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : !post ? (
          <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h1 className="text-2xl font-bold text-navy mb-2">Post Not Found</h1>
            <p className="text-slate-500 mb-6">This article doesn&apos;t exist.</p>
            <Link href="/blog">
              <Button className="rounded-xl bg-royal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        ) : (<>
      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 container mx-auto px-4 lg:px-8 flex items-end pb-12">
            <Link
              href="/blog"
              className="absolute top-6 left-4 lg:left-8 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 py-10 max-w-3xl">
        {!post.coverImage && (
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-royal transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        )}

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.category && (
              <Badge variant="secondary" className="text-xs font-semibold bg-royal/5 text-royal border-none">
                <Tag className="h-3 w-3 mr-1" />
                {post.category}
              </Badge>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.views} views
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4 leading-tight text-balance">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-royal flex items-center justify-center text-white text-sm font-bold">
                {post.authorName?.charAt(0) || 'C'}
              </div>
              <span className="text-sm font-medium text-navy">{post.authorName}</span>
            </div>
            <span className="text-sm text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Content */}
          <div className="prose prose-slate prose-lg max-w-none
            prose-headings:text-navy prose-headings:font-bold
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-a:text-royal prose-a:no-underline hover:prose-a:underline
            prose-strong:text-navy
            prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-navy prose-pre:text-white
            prose-img:rounded-2xl
            prose-blockquote:border-royal prose-blockquote:bg-royal/5 prose-blockquote:rounded-r-xl"
          >
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </motion.article>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-100">
            <h2 className="text-xl font-bold text-navy mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`}>
                  <article className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-premium hover:shadow-premium-xl hover:-translate-y-1 transition-all duration-400">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      {r.coverImage ? (
                        <Image
                          src={r.coverImage}
                          alt={r.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="33vw"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-royal/10">
                          <BookOpen className="h-8 w-8 text-royal/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-navy line-clamp-2 group-hover:text-royal transition-colors mb-2">
                        {r.title}
                      </h3>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {r.authorName}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      </>)}
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
