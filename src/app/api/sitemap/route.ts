import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://chap.co.ke'

export async function GET() {
  try {
    const [listings, blogPosts, categories, locations] = await Promise.all([
      db.listing.findMany({
        where: { status: 'active' },
        select: { slug: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
      db.blogPost.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      db.category.findMany({
        where: { isActive: true, parentId: null },
        select: { slug: true },
      }),
      db.location.findMany({
        where: { isActive: true, parentId: null },
        select: { slug: true },
      }),
    ])

    const urls: string[] = []

    // Static pages
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/listings', priority: '0.9', changefreq: 'hourly' },
      { path: '/blog', priority: '0.7', changefreq: 'weekly' },
      { path: '/faq', priority: '0.5', changefreq: 'monthly' },
      { path: '/contact', priority: '0.5', changefreq: 'monthly' },
      { path: '/about', priority: '0.5', changefreq: 'monthly' },
      { path: '/terms', priority: '0.3', changefreq: 'yearly' },
      { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
    ]

    for (const page of staticPages) {
      urls.push(`  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
    }

    // Category pages
    for (const cat of categories) {
      urls.push(`  <url>
    <loc>${BASE_URL}/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
    }

    // Location pages
    for (const loc of locations) {
      urls.push(`  <url>
    <loc>${BASE_URL}/location/${loc.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
    }

    // Listing pages
    for (const listing of listings) {
      urls.push(`  <url>
    <loc>${BASE_URL}/listing/${listing.slug}</loc>
    <lastmod>${listing.updatedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`)
    }

    // Blog posts
    for (const post of blogPosts) {
      urls.push(`  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`)
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
  }
}
