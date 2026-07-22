import { db } from './src/lib/db'

function makeSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7)
}

async function seedMorePremium() {
  console.log('🏪 Adding 2 more premium shops...\n')

  const hashPassword = (await import('./src/lib/auth')).hashPassword
  const pwd = await hashPassword('premium123')

  const allCats = await db.category.findMany()
  const catMap: Record<string, string> = {}
  for (const c of allCats) catMap[c.slug] = c.id

  const allLocs = await db.location.findMany()
  const locMap: Record<string, string> = {}
  for (const l of allLocs) locMap[l.slug] = l.id

  const cid = (slug: string) => catMap[slug]
  const lid = (slug: string) => locMap[slug]

  const premiumUntil = new Date()
  premiumUntil.setMonth(premiumUntil.getMonth() + 3)

  // ── Premium Shop 1: Mzuri Home Interiors ─────────────────────────────────

  const shop1 = await db.user.upsert({
    where: { email: 'mzurihome@example.com' },
    update: {
      passwordHash: pwd, phone: '+254711333555', role: 'business',
      isVerified: true, isEmailVerified: true, isPhoneVerified: true, premiumUntil,
    },
    create: {
      name: 'Mzuri Home Interiors',
      email: 'mzurihome@example.com', username: 'mzurihomeinteriors',
      phone: '+254711333555', passwordHash: pwd, role: 'business',
      isVerified: true, isEmailVerified: true, isPhoneVerified: true, premiumUntil,
      bio: 'Premium furniture and home decor store in Nairobi. We deliver quality furniture, lighting, and home accessories across Kenya.',
    },
  })
  console.log(`  ✅ Shop 1: mzurihome@example.com / premium123`)

  await db.businessProfile.upsert({
    where: { userId: shop1.id },
    update: { companyName: 'Mzuri Home Interiors', description: 'Premium furniture and home decor store offering modern, classic, and bespoke pieces for every room.', industry: 'Home & Furniture', isVerified: true, verifiedAt: new Date(), website: 'https://mzurihome.co.ke', employeeCount: '10-50', foundedYear: 2020, address: 'Lavington, Nairobi, Kenya' },
    create: { userId: shop1.id, companyName: 'Mzuri Home Interiors', description: 'Premium furniture and home decor store offering modern, classic, and bespoke pieces for every room.', industry: 'Home & Furniture', isVerified: true, verifiedAt: new Date(), website: 'https://mzurihome.co.ke', employeeCount: '10-50', foundedYear: 2020, address: 'Lavington, Nairobi, Kenya' },
  })

  await db.sellerStats.upsert({
    where: { userId: shop1.id },
    update: { avgRating: 4.6, totalReviews: 42, totalSales: 187, responseTime: 2.1, responseRate: 97 },
    create: { userId: shop1.id, avgRating: 4.6, totalReviews: 42, totalSales: 187, responseTime: 2.1, responseRate: 97 },
  })

  await db.sellerPromotion.create({
    data: { userId: shop1.id, type: 'shop', amount: 500, duration: 'monthly', startDate: new Date(), endDate: premiumUntil, status: 'active' },
  })

  const homeListings = [
    { title: 'Modern 3-Seater Fabric Sofa Set', description: 'Elegant 3-seater fabric sofa in charcoal grey. High-density foam cushions, wooden frame, removable covers. Modern design fits any living room. Free delivery within Nairobi.', price: 65000, condition: 'New', cat: 'sofas-couches', loc: 'nairobi', featured: true, negotiable: true, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop' },
    { title: 'Scandinavian Oak Dining Table - 6 Seater', description: 'Solid oak dining table with 6 upholstered chairs. 180cm x 90cm table top with extendable leaf (+40cm). Matte lacquer finish. Built by local artisans. 2-year warranty.', price: 95000, condition: 'New', cat: 'kitchen-dining', loc: 'nairobi', featured: true, negotiable: false, img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop' },
    { title: 'King Size Bed Frame - Velvet Upholstered', description: 'Luxurious king-size bed frame in emerald green velvet. Wingback headboard with button tufting, solid wood slats, and chrome legs. No mattress included. Assembly provided.', price: 78000, condition: 'New', cat: 'beds-mattresses', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop' },
    { title: 'Set of 2 Bedside Tables - Marble Top', description: 'Pair of modern bedside tables with white marble-effect tops and gold metal legs. Drawer and open shelf storage. 50cm x 40cm x 55cm each. Easy assembly.', price: 22000, condition: 'New', cat: 'bedroom', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&h=400&fit=crop' },
    { title: 'Indoor Potted Plant Bundle - 5 Pieces', description: 'Set of 5 artificial indoor plants in stylish pots: Fiddle Leaf Fig (120cm), Snake Plant (80cm), Monstera (70cm), Aloe Vera (50cm), and succulent trio. No maintenance needed.', price: 12000, condition: 'New', cat: 'home-decor', loc: 'nairobi', featured: false, negotiable: false, img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=400&fit=crop' },
  ]

  for (const l of homeListings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping: ${l.title}`); continue }
    await db.listing.create({
      data: {
        title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price,
        condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!,
        userId: shop1.id, status: 'active',
        contactName: 'Mzuri Home Interiors', contactPhone: '+254711333555', contactEmail: 'mzurihome@example.com',
        isFeatured: l.featured, isNegotiable: l.negotiable, publishedAt: new Date(),
        images: { create: [{ url: l.img, alt: l.title, order: 0 }] },
      },
    })
    console.log(`  🛋️ Mzuri: ${l.title}`)
  }

  // ── Premium Shop 2: FreshBasket Kenya ────────────────────────────────────

  const shop2 = await db.user.upsert({
    where: { email: 'freshbasket@example.com' },
    update: {
      passwordHash: pwd, phone: '+254722444666', role: 'business',
      isVerified: true, isEmailVerified: true, isPhoneVerified: true, premiumUntil,
    },
    create: {
      name: 'FreshBasket Kenya',
      email: 'freshbasket@example.com', username: 'freshbasketkenya',
      phone: '+254722444666', passwordHash: pwd, role: 'business',
      isVerified: true, isEmailVerified: true, isPhoneVerified: true, premiumUntil,
      bio: 'Farm-fresh produce, dairy, and organic goods delivered straight to your doorstep. Supporting local Kenyan farmers.',
    },
  })
  console.log(`  ✅ Shop 2: freshbasket@example.com / premium123`)

  await db.businessProfile.upsert({
    where: { userId: shop2.id },
    update: { companyName: 'FreshBasket Kenya', description: 'Farm-fresh produce, dairy, and organic goods delivered straight to your doorstep. Supporting local Kenyan farmers since 2021.', industry: 'Agriculture & Food', isVerified: true, verifiedAt: new Date(), website: 'https://freshbasketkenya.co.ke', employeeCount: '10-50', foundedYear: 2021, address: 'Karen, Nairobi, Kenya' },
    create: { userId: shop2.id, companyName: 'FreshBasket Kenya', description: 'Farm-fresh produce, dairy, and organic goods delivered straight to your doorstep. Supporting local Kenyan farmers since 2021.', industry: 'Agriculture & Food', isVerified: true, verifiedAt: new Date(), website: 'https://freshbasketkenya.co.ke', employeeCount: '10-50', foundedYear: 2021, address: 'Karen, Nairobi, Kenya' },
  })

  await db.sellerStats.upsert({
    where: { userId: shop2.id },
    update: { avgRating: 4.8, totalReviews: 73, totalSales: 520, responseTime: 1.2, responseRate: 100 },
    create: { userId: shop2.id, avgRating: 4.8, totalReviews: 73, totalSales: 520, responseTime: 1.2, responseRate: 100 },
  })

  await db.sellerPromotion.create({
    data: { userId: shop2.id, type: 'shop', amount: 500, duration: 'monthly', startDate: new Date(), endDate: premiumUntil, status: 'active' },
  })

  const foodListings = [
    { title: 'Mixed Fresh Produce Box - Weekly Supply', description: 'Weekly mixed box: 5kg tomatoes, 3kg onions, 2kg Irish potatoes, 1kg carrots, 500g capsicum, 1 bunch each of sukuma wiki, spinach, and coriander. Sourced direct from Kirinyaga farms. Free delivery Nairobi.', price: 2500, condition: 'New', cat: 'fresh-produce', loc: 'nairobi', featured: true, negotiable: false, img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop' },
    { title: 'Organic Free-Range Eggs - Tray of 30', description: 'Farm-fresh organic free-range eggs from happy chickens raised in Naivasha. Rich orange yolks, no antibiotics, no hormones. Delivered in eco-friendly packaging. Order by 4pm for next-day delivery.', price: 750, condition: 'New', cat: 'dairy-eggs', loc: 'nairobi', featured: true, negotiable: false, img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=400&fit=crop' },
    { title: 'Raw Honey - 1kg Jar - Pure Kirinyaga', description: 'Pure, unprocessed raw honey direct from beekeepers in Kirinyaga. No additives, no pasteurization. Rich in antioxidants and natural enzymes. Packed in glass jars. Buy 2 get 10% off.', price: 1200, condition: 'New', cat: 'natural-organic', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop' },
    { title: 'Fresh Tilapia - 5kg Pack', description: 'Premium fresh tilapia from clean dam water in Kisumu. Gutted and scaled, ready to cook. Approx 6-8 fish per 5kg pack. Flash-frozen for freshness. Free delivery within Nairobi and Kisumu.', price: 2500, condition: 'New', cat: 'meat-fish', loc: 'nairobi', featured: false, negotiable: false, img: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=400&fit=crop' },
    { title: 'Assorted Fruit Basket - Premium Gift Pack', description: 'Beautiful gift basket with seasonal premium fruits: 6 mangoes, 6 avocados, 4 large oranges, 4 apples, 1 pineapple, 1 bunch of bananas, 250g grapes, and 2 passion fruits. Perfect for gifting. Includes a personalised card.', price: 3500, condition: 'New', cat: 'fresh-produce', loc: 'nairobi', featured: false, negotiable: false, img: 'https://images.unsplash.com/photo-1605025498551-5f2a0de892c5?w=600&h=400&fit=crop' },
  ]

  for (const l of foodListings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping: ${l.title}`); continue }
    await db.listing.create({
      data: {
        title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price,
        condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!,
        userId: shop2.id, status: 'active',
        contactName: 'FreshBasket Kenya', contactPhone: '+254722444666', contactEmail: 'freshbasket@example.com',
        isFeatured: l.featured, isNegotiable: l.negotiable, publishedAt: new Date(),
        images: { create: [{ url: l.img, alt: l.title, order: 0 }] },
      },
    })
    console.log(`  🥬 FreshBasket: ${l.title}`)
  }

  console.log(`\n🎉 2 more premium shops seeded!`)
  console.log(`   Shop 1: mzurihome@example.com / premium123`)
  console.log(`   Shop 2: freshbasket@example.com / premium123`)
}

seedMorePremium()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => process.exit(0))
