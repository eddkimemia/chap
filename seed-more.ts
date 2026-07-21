import { db } from './src/lib/db'

function makeSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7)
}

async function seedMore() {
  console.log('🌱 Seeding additional users and shops...\n')

  const hashPassword = (await import('./src/lib/auth')).hashPassword
  const pwd = await hashPassword('seller123')
  const shopPwd = await hashPassword('shop123')

  const allCats = await db.category.findMany()
  const catMap: Record<string, string> = {}
  for (const c of allCats) catMap[c.slug] = c.id

  const allLocs = await db.location.findMany()
  const locMap: Record<string, string> = {}
  for (const l of allLocs) locMap[l.slug] = l.id

  const cid = (slug: string) => catMap[slug]
  const lid = (slug: string) => locMap[slug]

  // ── 1. Two regular sellers ──────────────────────────────────────────────

  const user1 = await db.user.upsert({
    where: { email: 'mary@example.com' },
    update: { passwordHash: pwd, phone: '+254701234567', role: 'seller', isVerified: true, isEmailVerified: true, isPhoneVerified: true },
    create: { name: 'Mary Wanjiku', email: 'mary@example.com', username: 'marywanjiku', phone: '+254701234567', passwordHash: pwd, role: 'seller', isVerified: true, isEmailVerified: true, isPhoneVerified: true, bio: 'Selling quality pre-loved items in Nairobi.' },
  })
  console.log(`  ✅ User: mary@example.com / seller123`)

  const user2 = await db.user.upsert({
    where: { email: 'peter@example.com' },
    update: { passwordHash: pwd, phone: '+254712987654', role: 'seller', isVerified: true, isEmailVerified: true, isPhoneVerified: true },
    create: { name: 'Peter Omondi', email: 'peter@example.com', username: 'peteromondi', phone: '+254712987654', passwordHash: pwd, role: 'seller', isVerified: true, isEmailVerified: true, isPhoneVerified: true, bio: 'Electronics and gadgets enthusiast based in Mombasa.' },
  })
  console.log(`  ✅ User: peter@example.com / seller123`)

  // Seller stats
  await db.sellerStats.upsert({ where: { userId: user1.id }, update: { totalViews: 340, totalLeads: 18, totalMessages: 42, avgRating: 4.5, totalReviews: 6, responseTime: 3.1, responseRate: 92 }, create: { userId: user1.id, totalViews: 340, totalLeads: 18, totalMessages: 42, avgRating: 4.5, totalReviews: 6, responseTime: 3.1, responseRate: 92 } })
  await db.sellerStats.upsert({ where: { userId: user2.id }, update: { totalViews: 510, totalLeads: 29, totalMessages: 67, avgRating: 4.8, totalReviews: 9, responseTime: 1.8, responseRate: 98 }, create: { userId: user2.id, totalViews: 510, totalLeads: 29, totalMessages: 67, avgRating: 4.8, totalReviews: 9, responseTime: 1.8, responseRate: 98 } })

  // ── Mary's listings (4) ─────────────────────────────────────────────────

  const maryListings = [
    { title: 'Queen Size Bed Frame & Mattress', description: 'Solid wooden queen-size bed frame with a quality mattress. Used for 1 year, still in excellent condition. No stains, no sagging. Includes frame, mattress, and headboard.', price: 28000, condition: 'Used', cat: 'beds-mattresses', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop' },
    { title: 'Kitchen Appliances Bundle', description: 'Bundle includes: electric kettle, 2-slot toaster, blender, and a microwave (25L). All work perfectly, clean and well maintained. Selling because upgrading.', price: 15000, condition: 'Used', cat: 'kitchen-dining', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop' },
    { title: 'Women\'s Winter Jacket - North Face', description: 'Genuine North Face winter jacket, size M. Used for one trip to Europe. Warm, windproof, and in perfect condition. Multiple pockets, detachable hood.', price: 8500, condition: 'Used', cat: 'womens-clothing', loc: 'nairobi', featured: true, negotiable: true, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop' },
    { title: 'Yoga & Pilates Mat - Premium Thick', description: 'Premium 10mm thick yoga mat, non-slip surface. 183cm x 68cm. Includes carrying strap. Used only 3 times, like new. Perfect for home workouts.', price: 2500, condition: 'Used', cat: 'exercise-equipment', loc: 'nairobi', featured: false, negotiable: false, img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=400&fit=crop' },
  ]

  for (const l of maryListings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping Mary: ${l.title}`); continue }
    await db.listing.create({ data: { title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price, condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!, userId: user1.id, status: 'active', contactName: 'Mary Wanjiku', contactPhone: '+254701234567', contactEmail: 'mary@example.com', isFeatured: l.featured, isNegotiable: l.negotiable, publishedAt: new Date(), images: { create: [{ url: l.img, alt: l.title, order: 0 }] } } })
    console.log(`  📦 Mary: ${l.title}`)
  }

  // ── Peter's listings (4) ────────────────────────────────────────────────

  const peterListings = [
    { title: 'PlayStation 5 Digital Edition', description: 'PS5 Digital Edition with 2 controllers. Barely used, still under warranty until Dec 2026. Comes with original box, cables, and receipt. Games library available separately.', price: 52000, condition: 'Used', cat: 'gaming', loc: 'mombasa', featured: true, negotiable: true, img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=400&fit=crop' },
    { title: 'Bose QuietComfort Ultra Headphones', description: 'Bose QC Ultra wireless noise-cancelling headphones. Black, less than 2 months old. Comes with case, USB-C cable, and audio cable. Immaculate condition.', price: 28000, condition: 'Used', cat: 'headphones', loc: 'mombasa', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop' },
    { title: 'DJI Mini 4 Pro Drone Fly More Combo', description: 'DJI Mini 4 Pro with Fly More combo. Includes 3 batteries, charging hub, ND filters, propellers, and hard case. 20 flight hours total. Perfect for aerial photography.', price: 115000, condition: 'Used', cat: 'cameras', loc: 'mombasa', featured: true, negotiable: false, img: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&h=400&fit=crop' },
    { title: 'Electric Scooter - Xiaomi Mi Pro 4', description: 'Xiaomi Mi Electric Scooter Pro 4, 45km range, 30km/h top speed. Used for 3 months, only 200km. Foldable, perfect for last-mile commutes. Comes with charger.', price: 22000, condition: 'Used', cat: 'cycling-bicycles', loc: 'mombasa', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?w=600&h=400&fit=crop' },
  ]

  for (const l of peterListings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping Peter: ${l.title}`); continue }
    await db.listing.create({ data: { title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price, condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!, userId: user2.id, status: 'active', contactName: 'Peter Omondi', contactPhone: '+254712987654', contactEmail: 'peter@example.com', isFeatured: l.featured, isNegotiable: l.negotiable, publishedAt: new Date(), images: { create: [{ url: l.img, alt: l.title, order: 0 }] } } })
    console.log(`  📦 Peter: ${l.title}`)
  }

  // ── 3. Shop: GreenValley Farms ──────────────────────────────────────────

  const shop1 = await db.user.upsert({
    where: { email: 'greenvalley@example.com' },
    update: { passwordHash: shopPwd, phone: '+254733111222', role: 'business', isVerified: true, isEmailVerified: true, isPhoneVerified: true },
    create: { name: 'GreenValley Farms', email: 'greenvalley@example.com', username: 'greenvalleyfarms', phone: '+254733111222', passwordHash: shopPwd, role: 'business', isVerified: true, isEmailVerified: true, isPhoneVerified: true, bio: 'Fresh farm produce, livestock, and agricultural supplies from the heart of Kenya\'s breadbasket.' },
  })
  console.log(`\n  ✅ Shop: greenvalley@example.com / shop123`)

  await db.businessProfile.upsert({
    where: { userId: shop1.id },
    update: { companyName: 'GreenValley Farms', description: 'Fresh farm produce, livestock, and agricultural supplies delivered across Kenya. Based in Nakuru, serving Nairobi, Kisumu, and beyond. Certified organic and farm-fresh quality guaranteed.', industry: 'Agriculture', isVerified: true, verifiedAt: new Date(), website: 'https://greenvalleyfarms.co.ke', employeeCount: '10-50', foundedYear: 2018, address: 'Nakuru, Kenya' },
    create: { userId: shop1.id, companyName: 'GreenValley Farms', description: 'Fresh farm produce, livestock, and agricultural supplies delivered across Kenya. Based in Nakuru, serving Nairobi, Kisumu, and beyond. Certified organic and farm-fresh quality guaranteed.', industry: 'Agriculture', isVerified: true, verifiedAt: new Date(), website: 'https://greenvalleyfarms.co.ke', employeeCount: '10-50', foundedYear: 2018, address: 'Nakuru, Kenya' },
  })

  const shop1Listings = [
    { title: 'Fresh Organic Avocados - 50kg Box', description: 'Freshly picked organic avocados from our farm in Nakuru. 50kg box packed with premium-grade Hass avocados. Perfect for hotels, restaurants, and resellers. Weekly delivery available.', price: 6500, condition: 'New', cat: 'fresh-produce', loc: 'nakuru', featured: true, negotiable: true, img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=400&fit=crop' },
    { title: 'Free-Range Indigenous Chicken - 10 Pack', description: 'Farm-raised indigenous chicken (kienyeji). 10 healthy birds, 6-8 months old, free from hormones and antibiotics. Perfect for Christmas or special events. Delivery within 100km.', price: 8500, condition: 'New', cat: 'livestock', loc: 'nakuru', featured: true, negotiable: true, img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop' },
    { title: 'Grade A Camel Milk - 5L Jerrycan', description: 'Pure camel milk from our herd. Rich in nutrients, naturally low in cholesterol. Freshly collected and chilled. 5-liter jerrycans delivered twice weekly to Nairobi.', price: 3000, condition: 'New', cat: 'fresh-produce', loc: 'nakuru', featured: false, negotiable: false, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=400&fit=crop' },
    { title: 'Farm Compost Manure - 50kg Bag', description: 'Premium organic compost manure. Rich in nitrogen and essential minerals. Perfect for vegetable gardens, flower beds, and landscaping. 50kg bags, bulk orders discounted.', price: 800, condition: 'New', cat: 'fresh-produce', loc: 'nakuru', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop' },
    { title: 'Kenya Fresh Roses - Wholesale Bundle', description: 'Fresh-cut premium roses direct from our greenhouse. 100 stems per bundle, assorted colors. Long stems, 60cm+ length. Farm fresh, delivered within 24 hours of cutting.', price: 4500, condition: 'New', cat: 'fresh-produce', loc: 'nakuru', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=400&fit=crop' },
    { title: 'Irrigation Drip Kit - 1 Acre Setup', description: 'Complete drip irrigation kit for 1 acre. Includes mainline, drip tapes, fittings, filter, and connectors. Suitable for vegetables, tomatoes, and fruits. Easy DIY installation.', price: 18000, condition: 'New', cat: 'farm-machinery', loc: 'nakuru', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop' },
    { title: 'Honey - Pure & Natural 1L Jar', description: 'Pure raw honey from our beehives. Unprocessed, unfiltered, no additives. Rich amber color, naturally crystallized. 1-liter glass jars. Great for health enthusiasts and gift packs.', price: 1200, condition: 'New', cat: 'fresh-produce', loc: 'nakuru', featured: true, negotiable: false, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop' },
    { title: 'Pesticide-Free Kale (Sukuma Wiki) Bunch', description: 'Fresh sukuma wiki harvested daily. Grown without chemical pesticides. Rich green leaves, perfect for your kitchen. Sold in large bunches (~1kg each). Nairobi delivery available.', price: 150, condition: 'New', cat: 'fresh-produce', loc: 'nakuru', featured: false, negotiable: false, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=400&fit=crop' },
    { title: 'Farm Tractor Hire - Per Acre', description: 'Tractor ploughing services for your farm. Massey Ferguson tractors, experienced operators. Ploughing, harrowing, and planting. Per acre rates, discounts for 5+ acres.', price: 3500, condition: 'New', cat: 'farm-machinery', loc: 'nakuru', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1570636078373-7cad0233e2b5?w=600&h=400&fit=crop' },
    { title: 'Seedling Pack - Mixed Vegetables', description: 'High-yield vegetable seedling pack. 100 seedlings total: 20 tomato, 20 capsicum, 20 aubergine, 20 kale, 20 spinach. Disease-resistant varieties. Planting guide included.', price: 2500, condition: 'New', cat: 'fresh-produce', loc: 'nakuru', featured: false, negotiable: false, img: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&h=400&fit=crop' },
  ]

  for (const l of shop1Listings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping GreenValley: ${l.title}`); continue }
    await db.listing.create({ data: { title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price, condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!, userId: shop1.id, status: 'active', contactName: 'GreenValley Farms', contactPhone: '+254733111222', contactEmail: 'greenvalley@example.com', isFeatured: l.featured, isNegotiable: l.negotiable, publishedAt: new Date(), images: { create: [{ url: l.img, alt: l.title, order: 0 }] } } })
    console.log(`  📦 GreenValley: ${l.title}`)
  }

  // ── 4. Shop: TechMart Kenya ─────────────────────────────────────────────

  const shop2 = await db.user.upsert({
    where: { email: 'techmart@example.com' },
    update: { passwordHash: shopPwd, phone: '+254744333444', role: 'business', isVerified: true, isEmailVerified: true, isPhoneVerified: true },
    create: { name: 'TechMart Kenya', email: 'techmart@example.com', username: 'techmartkenya', phone: '+254744333444', passwordHash: shopPwd, role: 'business', isVerified: true, isEmailVerified: true, isPhoneVerified: true, bio: 'Your one-stop shop for electronics, gadgets, and tech accessories in Kenya.' },
  })
  console.log(`\n  ✅ Shop: techmart@example.com / shop123`)

  await db.businessProfile.upsert({
    where: { userId: shop2.id },
    update: { companyName: 'TechMart Kenya', description: 'Premium electronics, gadgets, computers, and tech accessories. Authorized dealers for major brands including Apple, Samsung, HP, and Dell. Nairobi CBD showroom with nationwide delivery.', industry: 'Electronics & Technology', isVerified: true, verifiedAt: new Date(), website: 'https://techmartkenya.co.ke', employeeCount: '20-50', foundedYear: 2021, address: 'CBD, Nairobi, Kenya' },
    create: { userId: shop2.id, companyName: 'TechMart Kenya', description: 'Premium electronics, gadgets, computers, and tech accessories. Authorized dealers for major brands including Apple, Samsung, HP, and Dell. Nairobi CBD showroom with nationwide delivery.', industry: 'Electronics & Technology', isVerified: true, verifiedAt: new Date(), website: 'https://techmartkenya.co.ke', employeeCount: '20-50', foundedYear: 2021, address: 'CBD, Nairobi, Kenya' },
  })

  const shop2Listings = [
    { title: 'Apple MacBook Air M3 15-inch', description: 'Brand new Apple MacBook Air 15-inch with M3 chip. 16GB RAM, 512GB SSD. Midnight color. Full warranty, sealed box. Includes 1-year AppleCare+.', price: 199000, condition: 'New', cat: 'laptops', loc: 'nairobi', featured: true, negotiable: false, img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=400&fit=crop' },
    { title: 'Samsung Galaxy S24 Ultra 512GB', description: 'Brand new Samsung Galaxy S24 Ultra, 512GB storage, 12GB RAM. Titanium Gray. Factory unlocked. Includes charger, case, and screen protector. 2-year seller warranty.', price: 165000, condition: 'New', cat: 'smartphones', loc: 'nairobi', featured: true, negotiable: true, img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop' },
    { title: 'HP LaserJet Pro M404dn Printer', description: 'HP LaserJet Pro M404dn, monochrome laser printer. Auto duplex, network-ready. High-yield toner compatible. Perfect for office use. Sealed box, full warranty.', price: 32000, condition: 'New', cat: 'printers-scanners', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop' },
    { title: 'Logitech MX Master 3S Mouse', description: 'Logitech MX Master 3S wireless mouse. Darkfield tracking, 8K DPI, USB-C charging. Ergonomic design, perfect for professionals. Sealed retail box.', price: 9500, condition: 'New', cat: 'computer-accessories', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=400&fit=crop' },
    { title: 'LG 27" 4K UHD Monitor', description: 'LG 27UP600-W 27" 4K UHD IPS monitor. HDR10 support, 99% sRGB. Ideal for design, video editing, and productivity. Includes HDMI and DP cables. 3-year warranty.', price: 42000, condition: 'New', cat: 'monitors', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=400&fit=crop' },
    { title: 'Apple AirPods Pro 2nd Gen USB-C', description: 'Apple AirPods Pro 2nd Generation with USB-C. Active noise cancellation, adaptive audio, IP54. Sealed retail box. 1-year Apple warranty.', price: 35000, condition: 'New', cat: 'headphones', loc: 'nairobi', featured: true, negotiable: false, img: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600&h=400&fit=crop' },
    { title: 'iPad Air M2 11-inch 256GB WiFi', description: 'Apple iPad Air M2 chip, 11-inch Liquid Retina display, 256GB storage, WiFi only. Starlight color. Includes charger and cable. Open box, unused. Full warranty.', price: 85000, condition: 'New', cat: 'tablets', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop' },
    { title: 'Seagate 2TB External Hard Drive', description: 'Seagate Backup Plus Slim 2TB portable external hard drive. USB 3.0, black. Backup software included. New in sealed box. 3-year warranty.', price: 6500, condition: 'New', cat: 'computer-accessories', loc: 'nairobi', featured: false, negotiable: false, img: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&h=400&fit=crop' },
    { title: 'TP-Link Deco X20 Mesh WiFi System', description: 'TP-Link Deco X20 AX1800 whole-home mesh WiFi system. 3-pack, covers up to 5,800 sq ft. WiFi 6, seamless roaming. New in box. Easy app setup.', price: 22000, condition: 'New', cat: 'networking', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&h=400&fit=crop' },
    { title: 'Razer Kraken V3 Pro Headset', description: 'Razer Kraken V3 Pro wireless gaming headset. THX Spatial Audio, haptic feedback, RGB lighting. USB-C, 40-hour battery. Like new, used for 2 weeks.', price: 18000, condition: 'Used', cat: 'gaming', loc: 'nairobi', featured: false, negotiable: true, img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=400&fit=crop' },
  ]

  for (const l of shop2Listings) {
    if (!cid(l.cat) || !lid(l.loc)) { console.warn(`  ⚠️  Skipping TechMart: ${l.title}`); continue }
    await db.listing.create({ data: { title: l.title, slug: makeSlug(l.title), description: l.description, price: l.price, condition: l.condition, categoryId: cid(l.cat)!, locationId: lid(l.loc)!, userId: shop2.id, status: 'active', contactName: 'TechMart Kenya', contactPhone: '+254744333444', contactEmail: 'techmart@example.com', isFeatured: l.featured, isNegotiable: l.negotiable, publishedAt: new Date(), images: { create: [{ url: l.img, alt: l.title, order: 0 }] } } })
    console.log(`  📦 TechMart: ${l.title}`)
  }

  const totalListings = await db.listing.count()
  console.log(`\n🎉 Done! ${totalListings} total listings in the database.`)
  console.log(`   Users:     mary@example.com / seller123  |  peter@example.com / seller123`)
  console.log(`   Shops:     greenvalley@example.com / shop123  |  techmart@example.com / shop123`)
  console.log(`   Shop URLs: /shop/greenvalleyfarms  |  /shop/techmartkenya`)
}

seedMore()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => process.exit(0))
