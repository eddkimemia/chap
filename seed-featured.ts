import { db } from './src/lib/db'

function makeSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7)
}

async function seedFeaturedOnly() {
  console.log('⭐ Seeding featured-only listings...\n')

  const hashPassword = (await import('./src/lib/auth')).hashPassword
  const pwd = await hashPassword('featured123')

  const allCats = await db.category.findMany()
  const catMap: Record<string, string> = {}
  for (const c of allCats) catMap[c.slug] = c.id

  const allLocs = await db.location.findMany()
  const locMap: Record<string, string> = {}
  for (const l of allLocs) locMap[l.slug] = l.id

  const cid = (slug: string) => catMap[slug]
  const lid = (slug: string) => locMap[slug]

  const now = new Date()
  const featuredUntil = new Date()
  featuredUntil.setMonth(featuredUntil.getMonth() + 6)

  // ── Shop 1: Premium Auto Gallery ──────────────────────────────────────────

  const shop1 = await db.user.upsert({
    where: { email: 'premiumauto@example.com' },
    update: { passwordHash: pwd, phone: '+254722100201', role: 'business', isVerified: true, isEmailVerified: true, isPhoneVerified: true },
    create: { name: 'Premium Auto Gallery', email: 'premiumauto@example.com', username: 'premiumautogallery', phone: '+254722100201', passwordHash: pwd, role: 'business', isVerified: true, isEmailVerified: true, isPhoneVerified: true, bio: 'Curated collection of premium vehicles in Nairobi.' },
  })
  console.log(`  ✅ Shop 1: premiumauto@example.com / featured123`)

  await db.sellerStats.upsert({
    where: { userId: shop1.id },
    update: { avgRating: 4.9, totalReviews: 38, totalSales: 145, responseTime: 1.2, responseRate: 100 },
    create: { userId: shop1.id, avgRating: 4.9, totalReviews: 38, totalSales: 145, responseTime: 1.2, responseRate: 100 },
  })

  const autoListings = [
    { title: '2023 Mercedes-Benz GLE 350d', description: '2023 Mercedes-Benz GLE 350d 4MATIC. 15,000km, panoramic sunroof, Burmester sound, ambient lighting, 360° camera. Like new condition, full service history.', price: 12500000, condition: 'Used', cat: 'suvs-crossovers', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=600&h=400&fit=crop' },
    { title: '2024 BMW X5 xDrive40i', description: '2024 BMW X5 xDrive40i M Sport. 8,000km, Tanzanite Blue, Cognac leather, Executive Package, Driving Assistance Pro. Still under full factory warranty.', price: 14500000, condition: 'New', cat: 'suvs-crossovers', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1556189250-72b8cfb5a5ec?w=600&h=400&fit=crop' },
    { title: 'Porsche Cayenne Turbo GT', description: '2023 Porsche Cayenne Turbo GT Coupe. 4.0L V8 twin-turbo, 631hp. Only 5,000km, Carmine Red, full leather, carbon fibre package. A true collector piece.', price: 28000000, condition: 'Used', cat: 'suvs-crossovers', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop' },
    { title: '2022 Range Rover Sport SVR', description: '2022 Range Rover Sport SVR 5.0L V8 Supercharged. 22,000km, Santorini Black, red leather, 22" alloys, Meridian sound. Service history complete.', price: 16500000, condition: 'Used', cat: 'suvs-crossovers', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1606664514610-e08b12f524e3?w=600&h=400&fit=crop' },
    { title: '2024 Lexus LX 600', description: '2024 Lexus LX 600 F Sport. 6,000km, Manganese Luster, semi-aniline leather, 25-speaker Mark Levinson, adaptive variable suspension, 7 seats.', price: 19500000, condition: 'New', cat: 'suvs-crossovers', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=400&fit=crop' },
  ]

  for (const l of autoListings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping: ${l.title}`); continue }
    await db.listing.create({
      data: {
        title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price,
        condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!,
        userId: shop1.id, status: 'active', isFeatured: true, featuredUntil,
        contactName: 'Premium Auto Gallery', contactPhone: '+254722100201', contactEmail: 'premiumauto@example.com',
        isNegotiable: true, publishedAt: now,
        images: { create: [{ url: l.img, alt: l.title, order: 0 }] },
      },
    })
    console.log(`  🚗 ${l.title}`)
  }

  // ── Shop 2: Tech Haven ────────────────────────────────────────────────────

  const shop2 = await db.user.upsert({
    where: { email: 'techhaven@example.com' },
    update: { passwordHash: pwd, phone: '+254733300401', role: 'business', isVerified: true, isEmailVerified: true, isPhoneVerified: true },
    create: { name: 'Tech Haven', email: 'techhaven@example.com', username: 'techhaven', phone: '+254733300401', passwordHash: pwd, role: 'business', isVerified: true, isEmailVerified: true, isPhoneVerified: true, bio: 'Premium electronics and gadgets store in Nairobi.' },
  })
  console.log(`  ✅ Shop 2: techhaven@example.com / featured123`)

  await db.sellerStats.upsert({
    where: { userId: shop2.id },
    update: { avgRating: 4.8, totalReviews: 62, totalSales: 310, responseTime: 0.9, responseRate: 99 },
    create: { userId: shop2.id, avgRating: 4.8, totalReviews: 62, totalSales: 310, responseTime: 0.9, responseRate: 99 },
  })

  const techListings = [
    { title: 'Apple MacBook Pro 14" M4 Max', description: 'Brand new Apple MacBook Pro 14" with M4 Max chip, 36GB RAM, 1TB SSD. Space Black. Sealed box with full manufacturer warranty.', price: 385000, condition: 'New', cat: 'laptops', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop' },
    { title: 'Samsung Galaxy Z Fold 6 512GB', description: 'Brand new Samsung Galaxy Z Fold 6, 512GB, Navy. 7.6" foldable display, 12GB RAM, S Pen support. Sealed box with 2-year seller warranty.', price: 210000, condition: 'New', cat: 'smartphones', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop' },
    { title: 'Sony A7 IV Mirrorless Camera Kit', description: 'Sony Alpha A7 IV with 28-70mm f3.5-5.6 kit lens. 33MP full-frame, 4K 60p video. Includes 128GB SD card, spare battery, and carry bag. New in box.', price: 285000, condition: 'New', cat: 'cameras', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop' },
    { title: 'Apple Vision Pro 512GB', description: 'Apple Vision Pro 512GB. Spatial computing revolution. Used for demos only, like new condition. Includes light seal, battery, and polishing cloth.', price: 450000, condition: 'Used', cat: 'wearables', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&h=400&fit=crop' },
  ]

  for (const l of techListings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping: ${l.title}`); continue }
    await db.listing.create({
      data: {
        title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price,
        condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!,
        userId: shop2.id, status: 'active', isFeatured: true, featuredUntil,
        contactName: 'Tech Haven', contactPhone: '+254733300401', contactEmail: 'techhaven@example.com',
        isNegotiable: true, publishedAt: now,
        images: { create: [{ url: l.img, alt: l.title, order: 0 }] },
      },
    })
    console.log(`  💻 ${l.title}`)
  }

  // ── Seller 3: DesignerLiving (individual seller) ──────────────────────────

  const seller3 = await db.user.upsert({
    where: { email: 'designerliving@example.com' },
    update: { passwordHash: pwd, phone: '+254711500601', role: 'seller', isVerified: true, isEmailVerified: true, isPhoneVerified: true },
    create: { name: 'Grace Akinyi', email: 'designerliving@example.com', username: 'designerliving', phone: '+254711500601', passwordHash: pwd, role: 'seller', isVerified: true, isEmailVerified: true, isPhoneVerified: true, bio: 'Interior designer selling curated home pieces.' },
  })
  console.log(`  ✅ Seller 3: designerliving@example.com / featured123`)

  await db.sellerStats.upsert({
    where: { userId: seller3.id },
    update: { avgRating: 4.7, totalReviews: 18, totalSales: 55, responseTime: 2.5, responseRate: 95 },
    create: { userId: seller3.id, avgRating: 4.7, totalReviews: 18, totalSales: 55, responseTime: 2.5, responseRate: 95 },
  })

  const homeListings = [
    { title: 'Italian Leather Chesterfield Sofa', description: 'Handcrafted Italian premium leather Chesterfield sofa in Oxblood. Deep button tufting, nail head trim, solid mahogany frame. 3-seater, 220cm wide. Imported, 1 year old.', price: 180000, condition: 'Used', cat: 'sofas-couches', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop' },
    { title: 'Persian Hand-Knotted Silk Rug 6x9', description: 'Authentic Persian hand-knotted silk rug, 6x9 feet. Traditional floral pattern in navy and ivory. Professionally cleaned, excellent condition. Appraised at KES 350,000.', price: 220000, condition: 'Used', cat: 'carpets-rugs', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&h=400&fit=crop' },
    { title: 'Crystal Chandelier - 8-Light', description: 'Stunning 8-light crystal chandelier by Schonbek. Swarovski crystals, polished gold frame. 90cm diameter, adjustable drop. Perfect for dining room or grand entrance.', price: 140000, condition: 'New', cat: 'lighting-lamps', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=400&fit=crop' },
    { title: 'Minimalist Walnut Media Console', description: 'Solid walnut media console with matte black metal legs. 180cm x 45cm x 55cm. 4 cable-management compartments, 2 drawers. Made by Nairobi artisans.', price: 75000, condition: 'New', cat: 'tables', loc: 'nairobi', img: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=600&h=400&fit=crop' },
  ]

  for (const l of homeListings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping: ${l.title}`); continue }
    await db.listing.create({
      data: {
        title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price,
        condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!,
        userId: seller3.id, status: 'active', isFeatured: true, featuredUntil,
        contactName: 'Grace Akinyi', contactPhone: '+254711500601', contactEmail: 'designerliving@example.com',
        isNegotiable: true, publishedAt: now,
        images: { create: [{ url: l.img, alt: l.title, order: 0 }] },
      },
    })
    console.log(`  🛋️ ${l.title}`)
  }

  console.log(`\n🎉 Seeded ${autoListings.length + techListings.length + homeListings.length} featured-only listings!`)
  console.log(`   Shop 1: premiumauto@example.com / featured123`)
  console.log(`   Shop 2: techhaven@example.com / featured123`)
  console.log(`   Seller: designerliving@example.com / featured123`)
}

seedFeaturedOnly()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => process.exit(0))
