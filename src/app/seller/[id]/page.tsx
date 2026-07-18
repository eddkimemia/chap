import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { SellerProfileClient } from '@/components/classifieds/seller-profile-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    select: { name: true, avatar: true, bio: true, createdAt: true, profile: { select: { city: true, country: true } } },
  })
  if (!user) return { title: 'Seller Not Found - ChapKE' }

  const cityPart = user.profile?.city ? ` in ${user.profile.city}, ${user.profile.country || 'Kenya'}` : ''
  const description = `${user.name} — seller on ChapKE${cityPart}. ${user.bio ? user.bio.slice(0, 120) : 'Browse their listings and reviews.'}`

  return {
    title: `${user.name} - Seller Profile | ChapKE`,
    description: description.slice(0, 200),
    openGraph: {
      title: `${user.name} - Seller on ChapKE`,
      description: description.slice(0, 200),
      images: user.avatar ? [{ url: user.avatar }] : [],
      type: 'profile',
      siteName: 'ChapKE',
      url: `https://chapke.co.ke/seller/${id}`,
    },
    twitter: {
      card: 'summary',
      title: `${user.name} - Seller Profile`,
      description: description.slice(0, 200),
      images: user.avatar ? [user.avatar] : [],
    },
    alternates: { canonical: `https://chapke.co.ke/seller/${id}` },
  }
}

export default async function SellerPage({ params }: PageProps) {
  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    select: { name: true, avatar: true, bio: true, createdAt: true, profile: { select: { city: true, country: true } } },
  })
  if (!user) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    image: user.avatar || undefined,
    description: user.bio || undefined,
    url: `https://chapke.co.ke/seller/${id}`,
    ...(user.profile?.city ? { homeLocation: { '@type': 'Place', name: `${user.profile.city}, ${user.profile.country || 'Kenya'}` } } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SellerProfileClient sellerId={id} />
    </>
  )
}
