import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE_URL = 'https://chap.co.ke'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
  ]

  const categoryPages: MetadataRoute.Sitemap = [
    'vehicles', 'property', 'electronics', 'phones-tablets', 'fashion',
    'jobs', 'services', 'agriculture', 'furniture-home', 'health-beauty',
    'sports-outdoors', 'business-industrial',
  ].map((slug) => ({
    url: `${BASE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const locationPages: MetadataRoute.Sitemap = (await db.location.findMany({
    where: { parentId: null },
    select: { slug: true },
  })).map((l) => ({
    url: `${BASE_URL}/location/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...categoryPages, ...locationPages]
}
