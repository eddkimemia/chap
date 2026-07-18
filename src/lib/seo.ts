interface ListingSchemaInput {
  id: string
  title: string
  description: string
  price: number
  currency: string
  images: { url: string }[]
  category: { name: string; slug: string }
  location: { name: string; slug: string }
  user: { name: string }
  createdAt: string
  condition: string
}

export function generateListingSchema(listing: ListingSchemaInput) {
  const images = listing.images.map((img) => img.url)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: images.length > 0 ? images : undefined,
    brand: {
      '@type': 'Brand',
      name: listing.user.name,
    },
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency,
      availability: 'https://schema.org/InStock',
      itemCondition: listing.condition === 'New'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    },
    category: listing.category.name,
    dateCreated: listing.createdAt,
    sku: listing.id,
  }
}

interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ChapKE',
    url: 'https://chapke.com',
    logo: 'https://chapke.com/logo.svg',
    description: "Kenya's largest online marketplace. Buy and sell electronics, cars, fashion, collectibles, sporting goods, digital cameras, and everything else on ChapKE.",
    sameAs: [
      'https://twitter.com/chapke',
      'https://facebook.com/chapke',
      'https://instagram.com/chapke',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@chapke.com',
      availableLanguage: ['English', 'Swahili'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KE',
    },
  }
}
