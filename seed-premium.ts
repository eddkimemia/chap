import { db } from './src/lib/db'

function makeSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7)
}

async function seedPremium() {
  console.log('🏪 Creating premium sellers...\n')

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

  // ── Premium Seller 1: AutoWorld Kenya ────────────────────────────────────

  const seller1 = await db.user.upsert({
    where: { email: 'autoworld@example.com' },
    update: {
      passwordHash: pwd,
      phone: '+254722111333',
      role: 'business',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      premiumUntil,
    },
    create: {
      name: 'AutoWorld Kenya',
      email: 'autoworld@example.com',
      username: 'autoworldkenya',
      phone: '+254722111333',
      passwordHash: pwd,
      role: 'business',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      premiumUntil,
      bio: 'Premium dealership offering certified pre-owned vehicles and auto parts in Nairobi.',
    },
  })
  console.log(`  ✅ Seller 1: autoworld@example.com / premium123 (premium until ${premiumUntil.toLocaleDateString()})`)

  await db.businessProfile.upsert({
    where: { userId: seller1.id },
    update: { companyName: 'AutoWorld Kenya', description: 'Premium dealership offering certified pre-owned vehicles and auto parts in Nairobi.', industry: 'Automotive', isVerified: true, verifiedAt: new Date(), website: 'https://autoworldkenya.co.ke', employeeCount: '10-50', foundedYear: 2019, address: 'Industrial Area, Nairobi, Kenya' },
    create: { userId: seller1.id, companyName: 'AutoWorld Kenya', description: 'Premium dealership offering certified pre-owned vehicles and auto parts in Nairobi.', industry: 'Automotive', isVerified: true, verifiedAt: new Date(), website: 'https://autoworldkenya.co.ke', employeeCount: '10-50', foundedYear: 2019, address: 'Industrial Area, Nairobi, Kenya' },
  })

  await db.sellerStats.upsert({
    where: { userId: seller1.id },
    update: { avgRating: 4.7, totalReviews: 24, totalSales: 89, responseTime: 1.5, responseRate: 99 },
    create: { userId: seller1.id, avgRating: 4.7, totalReviews: 24, totalSales: 89, responseTime: 1.5, responseRate: 99 },
  })

  // SellerPromotion records
  await db.sellerPromotion.create({
    data: { userId: seller1.id, type: 'shop', amount: 500, duration: 'monthly', startDate: new Date(), endDate: premiumUntil, status: 'active' },
  })

  const autoListings = [
    { title: '2022 Toyota Land Cruiser Prado TX', description: '2022 Toyota Land Cruiser Prado TX 2.8L Diesel. 25,000km, full service history, sunroof, leather seats, 360° camera, blind spot monitoring. One owner, accident-free.', price: 8500000, condition: 'Used', cat: 'suvs-crossovers', loc: 'nairobi', featured: true, negotiable: true, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop' },
    { title: '2023 Nissan X-Trail e-Power', description: '2023 Nissan X-Trail e-Power 4WD. Only 12,000km, still under manufacturer warranty until 2027. e-Power hybrid technology, panoramic sunroof, ProPILOT assist.', price: 5200000, condition: 'New', cat: 'suvs-crossovers', loc: 'nairobi', featured: true, negotiable: true, img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop' },
    { title: '2019 Mazda CX-5 GT', description: '2019 Mazda CX-5 GT 2.5L petrol. 45,000km, full service history, Bose sound system, leather interior, heads-up display, memory seats. Well maintained.', price: 3200000, condition: 'Used', cat: 'suvs-crossovers', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=400&fit=crop' },
    { title: 'Alloy Rims Set - 18" BMW Style', description: 'Set of 4 original BMW 18-inch alloy rims with near-new Pirelli run-flat tyres (225/45R18). Bolt pattern 5x120. Perfect condition, no scratches or bends.', price: 85000, condition: 'Used', cat: 'vehicle-parts', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1580019542182-34b1b0e26c76?w=600&h=400&fit=crop' },
    { title: 'Car Detailing & Ceramic Coating Package', description: 'Professional full exterior and interior detailing plus 5-year ceramic coating. Includes paint correction, deep interior clean, engine bay detailing, and nano-ceramic coating. Satisfaction guaranteed.', price: 25000, condition: 'New', cat: 'car-care', loc: 'nairobi', featured: false, negotiable: false, img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=400&fit=crop' },
  ]

  for (const l of autoListings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping: ${l.title}`); continue }
    await db.listing.create({
      data: {
        title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price,
        condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!,
        userId: seller1.id, status: 'active',
        contactName: 'AutoWorld Kenya', contactPhone: '+254722111333', contactEmail: 'autoworld@example.com',
        isFeatured: l.featured, isNegotiable: l.negotiable, publishedAt: new Date(),
        images: { create: [{ url: l.img, alt: l.title, order: 0 }] },
      },
    })
    console.log(`  🚗 AutoWorld: ${l.title}`)
  }

  // ── Premium Seller 2: TechVault Africa ────────────────────────────────────

  const seller2 = await db.user.upsert({
    where: { email: 'techvault@example.com' },
    update: {
      passwordHash: pwd,
      phone: '+254733222444',
      role: 'business',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      premiumUntil,
    },
    create: {
      name: 'TechVault Africa',
      email: 'techvault@example.com',
      username: 'techvaultafrica',
      phone: '+254733222444',
      passwordHash: pwd,
      role: 'business',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      premiumUntil,
      bio: 'East Africa\'s leading electronics retailer. Authorized dealer for Apple, Samsung, Sony, and more.',
    },
  })
  console.log(`  ✅ Seller 2: techvault@example.com / premium123 (premium until ${premiumUntil.toLocaleDateString()})`)

  await db.businessProfile.upsert({
    where: { userId: seller2.id },
    update: { companyName: 'TechVault Africa', description: 'East Africa\'s leading electronics retailer. Authorized dealer for Apple, Samsung, Sony, and more.', industry: 'Electronics', isVerified: true, verifiedAt: new Date(), website: 'https://techvaultafrica.co.ke', employeeCount: '50-200', foundedYear: 2017, address: 'Westlands, Nairobi, Kenya' },
    create: { userId: seller2.id, companyName: 'TechVault Africa', description: 'East Africa\'s leading electronics retailer. Authorized dealer for Apple, Samsung, Sony, and more.', industry: 'Electronics', isVerified: true, verifiedAt: new Date(), website: 'https://techvaultafrica.co.ke', employeeCount: '50-200', foundedYear: 2017, address: 'Westlands, Nairobi, Kenya' },
  })

  await db.sellerStats.upsert({
    where: { userId: seller2.id },
    update: { avgRating: 4.9, totalReviews: 156, totalSales: 430, responseTime: 0.8, responseRate: 100 },
    create: { userId: seller2.id, avgRating: 4.9, totalReviews: 156, totalSales: 430, responseTime: 0.8, responseRate: 100 },
  })

  await db.sellerPromotion.create({
    data: { userId: seller2.id, type: 'shop', amount: 500, duration: 'monthly', startDate: new Date(), endDate: premiumUntil, status: 'active' },
  })

  const techListings = [
    { title: 'MacBook Pro 16" M3 Max - 64GB/1TB', description: 'Brand new MacBook Pro 16" with M3 Max chip, 64GB unified memory, 1TB SSD. Space Black. Sealed box with full manufacturer warranty. Authorized Apple reseller. Price includes VAT and 1-year warranty.', price: 420000, condition: 'New', cat: 'laptops', loc: 'nairobi', featured: true, negotiable: false, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop' },
    { title: 'Samsung Galaxy S24 Ultra 512GB', description: 'Brand new Samsung Galaxy S24 Ultra, 512GB storage, 12GB RAM. Titanium Gray. Comes with official Samsung case and screen protector. Dual SIM, 200MP camera, S Pen included.', price: 165000, condition: 'New', cat: 'smartphones', loc: 'nairobi', featured: true, negotiable: true, img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop' },
    { title: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise-cancelling headphones. 30-hour battery life, crystal-clear hands-free calling, multipoint connection. Midnight Blue. Brand new, sealed.', price: 32000, condition: 'New', cat: 'headphones', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=400&fit=crop' },
    { title: 'Apple iPad Air M2 11" 256GB WiFi', description: 'Apple iPad Air with M2 chip, 11-inch Liquid Retina display, 256GB storage. Starlight colour. Includes Apple Pencil Pro support. Brand new sealed box.', price: 95000, condition: 'New', cat: 'tablets', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop' },
    { title: 'Logitech MX Master 3S Mouse + MX Keys Combo', description: 'Premium productivity combo. MX Master 3S ergonomic mouse (quiet clicks, 8000 DPI) and MX Keys illuminated wireless keyboard. Works with Mac, Windows, Linux. Like new, used 1 month.', price: 22000, condition: 'Used', cat: 'computer-accessories', loc: 'nairobi', featured: false, negotiable: false, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop' },
  ]

  for (const l of techListings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping: ${l.title}`); continue }
    await db.listing.create({
      data: {
        title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price,
        condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!,
        userId: seller2.id, status: 'active',
        contactName: 'TechVault Africa', contactPhone: '+254733222444', contactEmail: 'techvault@example.com',
        isFeatured: l.featured, isNegotiable: l.negotiable, publishedAt: new Date(),
        images: { create: [{ url: l.img, alt: l.title, order: 0 }] },
      },
    })
    console.log(`  💻 TechVault: ${l.title}`)
  }

  console.log(`\n🎉 Premium sellers seeded!`)
  console.log(`   Seller 1: autoworld@example.com / premium123`)
  console.log(`   Seller 2: techvault@example.com / premium123`)
}

seedPremium()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => process.exit(0))
