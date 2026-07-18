import type { Metadata } from 'next'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'
import { SearchPageClient } from './client'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams
  const q = sp.q || sp.search || ''
  const title = q ? `Search "${q}" - ChapKE Kenya` : 'Search Listings - ChapKE Kenya'

  return {
    title,
    description: `Search results for ${q || 'all listings'} on ChapKE. Find the best deals in Kenya.`,
    alternates: { canonical: `https://chap.co.ke/search${q ? `?q=${encodeURIComponent(q)}` : ''}` },
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chap.co.ke' },
              { '@type': 'ListItem', position: 2, name: 'Search', item: `https://chap.co.ke/search${sp.q ? `?q=${encodeURIComponent(sp.q)}` : ''}` },
            ],
          }),
        }}
      />
      <Header />
      <main className="flex-1">
        <SearchPageClient
          initialParams={{
            q: sp.q || sp.search || '',
            category: sp.category || '',
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
