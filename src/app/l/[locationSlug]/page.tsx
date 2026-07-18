import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'
import { LocationBrowseClient } from './client'

interface PageProps {
  params: Promise<{ locationSlug: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locationSlug } = await params
  const location = await db.location.findFirst({
    where: { slug: locationSlug },
    select: { name: true, slug: true },
  })
  if (!location) return { title: 'Location Not Found - ChapKE' }

  return {
    title: `Listings in ${location.name} - ChapKE Kenya`,
    description: `Browse classifieds in ${location.name}, Kenya. Find cars, phones, property, jobs and more in ${location.name}.`,
    openGraph: {
      title: `Listings in ${location.name} | ChapKE Kenya`,
      description: `Browse classifieds in ${location.name}, Kenya.`,
      type: 'website',
      siteName: 'ChapKE',
    },
    alternates: { canonical: `https://chapke.co.ke/l/${location.slug}` },
  }
}

export default async function LocationPage({ params, searchParams }: PageProps) {
  const { locationSlug } = await params
  const sp = await searchParams

  const location = await db.location.findFirst({
    where: { slug: locationSlug },
    select: {
      id: true, name: true, slug: true, parentId: true,
      children: { select: { id: true, name: true, slug: true } },
    },
  })

  if (!location) notFound()

  const parentLocation = location.parentId
    ? await db.location.findUnique({
        where: { id: location.parentId },
        select: { id: true, name: true, slug: true },
      })
    : null

  const breadcrumbItems = parentLocation
    ? [{ name: 'Home', url: 'https://chapke.co.ke' }, { name: 'Locations', url: 'https://chapke.co.ke/locations' }, { name: parentLocation.name, url: `https://chapke.co.ke/l/${parentLocation.slug}` }, { name: location.name, url: `https://chapke.co.ke/l/${location.slug}` }]
    : [{ name: 'Home', url: 'https://chapke.co.ke' }, { name: 'Locations', url: 'https://chapke.co.ke/locations' }, { name: location.name, url: `https://chapke.co.ke/l/${location.slug}` }]

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
        <LocationBrowseClient
          location={JSON.parse(JSON.stringify(location))}
          parentLocation={parentLocation ? JSON.parse(JSON.stringify(parentLocation)) : null}
          initialSearchParams={{
            search: sp.search || '',
            category: sp.category || '',
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
