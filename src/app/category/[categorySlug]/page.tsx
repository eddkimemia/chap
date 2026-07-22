import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { siteConfig } from '@/lib/site'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'
import { CategoryBrowseClient } from './client'

interface PageProps {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params
  const category = await db.category.findFirst({
    where: { slug: categorySlug },
    select: { name: true, slug: true },
  })
  if (!category) return { title: `Category Not Found - ${siteConfig.name}` }

  return {
    title: `${category.name} - ${siteConfig.name} Kenya`,
    description: `Browse ${category.name} listings in Kenya. Find the best deals on ${category.name} across Nairobi, Mombasa, Kisumu and all counties.`,
    openGraph: {
      title: `${category.name} | ${siteConfig.name} Kenya`,
      description: `Browse ${category.name} for sale in Kenya.`,
      type: 'website',
      siteName: siteConfig.name,
    },
    alternates: { canonical: `${siteConfig.url}/category/${category.slug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { categorySlug } = await params
  const sp = await searchParams

  const category = await db.category.findFirst({
    where: { slug: categorySlug },
    select: {
      id: true, name: true, slug: true, icon: true, parentId: true,
      children: { select: { id: true, name: true, slug: true, icon: true } },
    },
  })

  if (!category) notFound()

  const parentCategory = category.parentId
    ? await db.category.findUnique({
        where: { id: category.parentId },
        select: { id: true, name: true, slug: true },
      })
    : null

  const breadcrumbItems = parentCategory
    ? [{ name: 'Home', url: siteConfig.url }, { name: parentCategory.name, url: `${siteConfig.url}/category/${parentCategory.slug}` }, { name: category.name, url: `${siteConfig.url}/category/${category.slug}` }]
    : [{ name: 'Home', url: siteConfig.url }, { name: category.name, url: `${siteConfig.url}/category/${category.slug}` }]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItems.map((item, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: item.name,
              item: item.url,
            })),
          }),
        }}
      />
      <Header />
      <main className="flex-1">
        <CategoryBrowseClient
          category={JSON.parse(JSON.stringify(category))}
          parentCategory={parentCategory ? JSON.parse(JSON.stringify(parentCategory)) : null}
          initialSearchParams={{
            search: sp.search || '',
            location: sp.location || '',
            minPrice: sp.minPrice || '',
            maxPrice: sp.maxPrice || '',
            condition: sp.condition || '',
            sort: sp.sort || 'newest',
            page: sp.page || '1',
          }}
        />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
