import { db } from './src/lib/db'

function makeSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7)
}

const shopListings = [
  {
    title: 'Toyota Hilux 2021 - Double Cabin',
    description: '2021 Toyota Hilux Double Cabin 4x4, 40,000km. Full service history, new tyres, canopy included. Perfect for both work and leisure. Accident-free and well maintained.',
    price: 4200000,
    condition: 'Used',
    categorySlug: 'pickup-trucks',
    locationSlug: 'nairobi',
    images: [
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&h=400&fit=crop',
    ],
    isFeatured: true,
    isNegotiable: true,
  },
  {
    title: '3-Bedroom Mansionette in Runda',
    description: 'Spacious 3-bedroom mansionette in prestigious Runda estate. Open-plan living, modern kitchen, guest toilet, master en-suite with walk-in closet. Large garden, double garage, staff quarters. 24hr security.',
    price: 180000,
    condition: 'New',
    categorySlug: 'houses-rent',
    locationSlug: 'nairobi',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
    ],
    isFeatured: true,
    isNegotiable: false,
  },
  {
    title: 'Samsung 65" Neo QLED 4K TV',
    description: 'Samsung 65-inch Neo QLED 4K Smart TV (QN65QN90C). 1 year old, like new condition. Comes with original remote and stand. Supports HDR10+, Dolby Atmos, and all streaming apps.',
    price: 145000,
    condition: 'Used',
    categorySlug: 'tvs-video',
    locationSlug: 'nairobi',
    images: [
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&h=400&fit=crop',
    ],
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Modern Office Desk & Chair Set',
    description: 'Executive office set including a 1.8m wooden desk with cable management and an ergonomic mesh-back chair with lumbar support. Both in excellent condition, used for 6 months only.',
    price: 45000,
    condition: 'Used',
    categorySlug: 'office-furniture',
    locationSlug: 'nairobi',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop',
    ],
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Professional Photography Package',
    description: 'Full-day professional photography package for events, weddings, or corporate shoots. Includes 500+ edited photos, 1 photographer + 1 assistant, online gallery, and 1-year cloud storage.',
    price: 35000,
    condition: 'New',
    categorySlug: 'photography',
    locationSlug: 'nairobi',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
    ],
    isFeatured: true,
    isNegotiable: false,
  },
  {
    title: 'Dairy Farming Package - 5 Friesian Cows',
    description: 'Ready-to-milk Friesian cows, all vaccinated and dewormed. Average 25L per cow per day. Delivery available within 200km of Nairobi. Includes 2 weeks feed to help with transition.',
    price: 850000,
    condition: 'New',
    categorySlug: 'livestock',
    locationSlug: 'nakuru',
    images: [
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&h=400&fit=crop',
    ],
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Land for Sale - 2 Acres along Thika Road',
    description: 'Prime 2-acre parcel along Thika Road, just 5km from Thika town. Ready title deed, suitable for residential or light commercial development. Electricity and water available. Security provided.',
    price: 12000000,
    condition: 'New',
    categorySlug: 'land-plots',
    locationSlug: 'kiambu',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop',
    ],
    isFeatured: true,
    isNegotiable: true,
  },
  {
    title: 'Safari Package - Maasai Mara 4 Days',
    description: 'All-inclusive 4-day/3-night Maasai Mara safari. Includes: return transport from Nairobi, full-board accommodation, park fees, game drives, and a professional guide. See the Big Five!',
    price: 65000,
    condition: 'New',
    categorySlug: 'tour-packages',
    locationSlug: 'nairobi',
    images: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop',
    ],
    isFeatured: true,
    isNegotiable: false,
  },
  {
    title: 'Home Gym Equipment Bundle',
    description: 'Complete home gym set: adjustable bench, dumbbells (2-20kg), barbell with weights (100kg total), squat rack, pull-up bar, yoga mat, and jump rope. Everything you need for a full-body workout.',
    price: 95000,
    condition: 'Used',
    categorySlug: 'exercise-equipment',
    locationSlug: 'nairobi',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
    ],
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Wholesale Fresh Produce - Weekly Supply',
    description: 'Weekly wholesale supply of fresh farm produce: 50kg tomatoes, 30kg onions, 20kg Irish potatoes, 10kg carrots, 5kg capsicum, and assorted greens. Direct from farm in Kirinyaga. Free delivery within Nairobi.',
    price: 25000,
    condition: 'New',
    categorySlug: 'fresh-produce',
    locationSlug: 'nairobi',
    images: [
      'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&h=400&fit=crop',
    ],
    isFeatured: false,
    isNegotiable: true,
  },
]

async function seedShop() {
  console.log('🏪 Creating shop with 10 listings...')

  const hashPassword = (await import('./src/lib/auth')).hashPassword
  const shopHash = await hashPassword('shop123')

  const shopUser = await db.user.upsert({
    where: { email: 'naivasdeals@example.com' },
    update: {
      passwordHash: shopHash,
      phone: '+254722100200',
      role: 'business',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
    create: {
      name: 'Naivas Deals Kenya',
      email: 'naivasdeals@example.com',
      username: 'naivasdeals',
      phone: '+254722100200',
      passwordHash: shopHash,
      role: 'business',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      bio: 'Your trusted marketplace for quality products across Kenya. From vehicles to fresh produce, we deliver excellence.',
    },
  })
  console.log(`  ✅ Created shop user: naivasdeals@example.com / shop123 (${shopUser.id})`)

  await db.businessProfile.upsert({
    where: { userId: shopUser.id },
    update: {
      companyName: 'Naivas Deals Kenya',
      description: 'Your trusted marketplace for quality products across Kenya. From vehicles to fresh produce, we deliver excellence. Serving Nairobi, Nakuru, Kiambu and beyond.',
      industry: 'Retail & E-commerce',
      isVerified: true,
      verifiedAt: new Date(),
      website: 'https://naivasdeals.co.ke',
      employeeCount: '10-50',
      foundedYear: 2020,
      address: 'CBD, Nairobi, Kenya',
    },
    create: {
      userId: shopUser.id,
      companyName: 'Naivas Deals Kenya',
      description: 'Your trusted marketplace for quality products across Kenya. From vehicles to fresh produce, we deliver excellence. Serving Nairobi, Nakuru, Kiambu and beyond.',
      industry: 'Retail & E-commerce',
      isVerified: true,
      verifiedAt: new Date(),
      website: 'https://naivasdeals.co.ke',
      employeeCount: '10-50',
      foundedYear: 2020,
      address: 'CBD, Nairobi, Kenya',
    },
  })
  console.log('  ✅ Created business profile')

  const allCategories = await db.category.findMany()
  const categoryMap: Record<string, string> = {}
  for (const c of allCategories) categoryMap[c.slug] = c.id

  const allLocations = await db.location.findMany()
  const locationMap: Record<string, string> = {}
  for (const l of allLocations) locationMap[l.slug] = l.id

  let created = 0
  for (const listing of shopListings) {
    const categoryId = categoryMap[listing.categorySlug]
    const locationId = locationMap[listing.locationSlug]
    if (!categoryId) { console.warn(`  ⚠️  Category slug not found: ${listing.categorySlug}`); continue }
    if (!locationId) { console.warn(`  ⚠️  Location slug not found: ${listing.locationSlug}`); continue }

    const slug = makeSlug(listing.title)

    await db.listing.create({
      data: {
        title: listing.title,
        slug,
        description: listing.description,
        price: listing.price,
        condition: listing.condition,
        categoryId,
        locationId,
        userId: shopUser.id,
        status: 'active',
        contactName: 'Naivas Deals',
        contactPhone: '+254722100200',
        contactEmail: 'info@naivasdeals.co.ke',
        isFeatured: listing.isFeatured,
        isNegotiable: listing.isNegotiable,
        publishedAt: new Date(),
        images: {
          create: listing.images.map((url, i) => ({ url, alt: `${listing.title} - Image ${i + 1}`, order: i })),
        },
      },
    })
    created++
    console.log(`  📦 Created: ${listing.title} (KES ${listing.price.toLocaleString()})`)
  }

  console.log(`\n🎉 Shop seeded with ${created} listings!`)
  console.log(`   Email:    naivasdeals@example.com`)
  console.log(`   Password: shop123`)
  console.log(`   Shop URL: /shop/naivasdeals`)
}

seedShop()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => process.exit(0))
