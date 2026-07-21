import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { SellerProfileClient } from '@/components/classifieds/seller-profile-client'

interface PageProps {
  params: Promise<{ id: string }>
}

const userSelect = {
  id: true, name: true, avatar: true, bio: true, username: true, createdAt: true,
  profile: { select: { city: true, country: true } },
} as const

async function resolveUser(idOrUsername: string) {
  const byId = await db.user.findUnique({ where: { id: idOrUsername }, select: userSelect })
  if (byId) return { user: byId, field: 'id' as const }
  const byUsername = await db.user.findUnique({ where: { username: idOrUsername }, select: userSelect })
  if (byUsername) return { user: byUsername, field: 'username' as const }
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const resolved = await resolveUser(id)
  if (!resolved) return { title: 'Seller Not Found - ChapKE' }
  const user = resolved.user

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
      url: `https://chap.co.ke/seller/${user.username || id}`,
    },
    twitter: {
      card: 'summary',
      title: `${user.name} - Seller Profile`,
      description: description.slice(0, 200),
      images: user.avatar ? [user.avatar] : [],
    },
    alternates: { canonical: `https://chap.co.ke/seller/${user.username || id}` },
  }
}

export default async function SellerPage({ params }: PageProps) {
  const { id } = await params
  const resolved = await resolveUser(id)
  if (!resolved) notFound()
  const user = resolved.user

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    image: user.avatar || undefined,
    description: user.bio || undefined,
    url: `https://chap.co.ke/seller/${user.username || id}`,
    ...(user.profile?.city ? { homeLocation: { '@type': 'Place', name: `${user.profile.city}, ${user.profile.country || 'Kenya'}` } } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SellerProfileClient sellerId={user.id} />
    </>
  )
}
