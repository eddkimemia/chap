import { db } from './src/lib/db';

const categories = [
  { name: 'Vehicles', slug: 'vehicles', icon: 'car', order: 1 },
  { name: 'Property', slug: 'property', icon: 'home', order: 2 },
  { name: 'Electronics', slug: 'electronics', icon: 'monitor', order: 3 },
  { name: 'Phones & Tablets', slug: 'phones-tablets', icon: 'smartphone', order: 4 },
  { name: 'Fashion', slug: 'fashion', icon: 'shirt', order: 5 },
  { name: 'Jobs', slug: 'jobs', icon: 'briefcase', order: 6 },
  { name: 'Services', slug: 'services', icon: 'wrench', order: 7 },
  { name: 'Agriculture', slug: 'agriculture', icon: 'trees', order: 8 },
  { name: 'Furniture & Home', slug: 'furniture-home', icon: 'sofa', order: 9 },
  { name: 'Health & Beauty', slug: 'health-beauty', icon: 'heart', order: 10 },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: 'dumbbell', order: 11 },
  { name: 'Business & Industrial', slug: 'business-industrial', icon: 'building', order: 12 },
  { name: 'Books & Media', slug: 'books-media', icon: 'book', order: 13 },
  { name: 'Baby & Kids', slug: 'baby-kids', icon: 'baby', order: 14 },
  { name: 'Pets & Animals', slug: 'pets-animals', icon: 'paw-print', order: 15 },
  { name: 'Food & Drinks', slug: 'food-drinks', icon: 'utensils', order: 16 },
  { name: 'Hobbies & Crafts', slug: 'hobbies-crafts', icon: 'palette', order: 17 },
  { name: 'Travel & Tourism', slug: 'travel-tourism', icon: 'plane', order: 18 },
];

const vehicleSubs = [
  { name: 'Cars', slug: 'cars', parentId: 'vehicles' },
  { name: 'Motorcycles', slug: 'motorcycles', parentId: 'vehicles' },
  { name: 'Trucks', slug: 'trucks', parentId: 'vehicles' },
  { name: 'Buses & Matatus', slug: 'buses-matatus', parentId: 'vehicles' },
  { name: 'Vehicle Parts', slug: 'vehicle-parts', parentId: 'vehicles' },
];

const propertySubs = [
  { name: 'Houses & Apartments', slug: 'houses-apartments', parentId: 'property' },
  { name: 'Land & Plots', slug: 'land-plots', parentId: 'property' },
  { name: 'Commercial Property', slug: 'commercial-property', parentId: 'property' },
  { name: 'Office Space', slug: 'office-space', parentId: 'property' },
];

const electronicsSubs = [
  { name: 'Laptops', slug: 'laptops', parentId: 'electronics' },
  { name: 'TVs & Video', slug: 'tvs-video', parentId: 'electronics' },
  { name: 'Cameras', slug: 'cameras', parentId: 'electronics' },
  { name: 'Audio & Speakers', slug: 'audio-speakers', parentId: 'electronics' },
  { name: 'Gaming', slug: 'gaming', parentId: 'electronics' },
];

const phoneSubs = [
  { name: 'Smartphones', slug: 'smartphones', parentId: 'phones-tablets' },
  { name: 'Tablets', slug: 'tablets', parentId: 'phones-tablets' },
  { name: 'Phone Accessories', slug: 'phone-accessories', parentId: 'phones-tablets' },
];

const fashionSubs = [
  { name: 'Men\'s Clothing', slug: 'mens-clothing', parentId: 'fashion' },
  { name: 'Women\'s Clothing', slug: 'womens-clothing', parentId: 'fashion' },
  { name: 'Shoes', slug: 'shoes', parentId: 'fashion' },
  { name: 'Watches', slug: 'watches', parentId: 'fashion' },
  { name: 'Bags & Accessories', slug: 'bags-accessories', parentId: 'fashion' },
];

const jobsSubs = [
  { name: 'Full Time', slug: 'full-time', parentId: 'jobs' },
  { name: 'Part Time', slug: 'part-time', parentId: 'jobs' },
  { name: 'Internship', slug: 'internship', parentId: 'jobs' },
  { name: 'Freelance', slug: 'freelance', parentId: 'jobs' },
];

const servicesSubs = [
  { name: 'Home Services', slug: 'home-services', parentId: 'services' },
  { name: 'Professional Services', slug: 'professional-services', parentId: 'services' },
  { name: 'Events & Photography', slug: 'events-photography', parentId: 'services' },
  { name: 'Tutoring & Lessons', slug: 'tutoring-lessons', parentId: 'services' },
];

const agricultureSubs = [
  { name: 'Farm Machinery', slug: 'farm-machinery', parentId: 'agriculture' },
  { name: 'Livestock', slug: 'livestock', parentId: 'agriculture' },
  { name: 'Seeds & Fertilizers', slug: 'seeds-fertilizers', parentId: 'agriculture' },
  { name: 'Fresh Produce', slug: 'fresh-produce', parentId: 'agriculture' },
];

const furnitureSubs = [
  { name: 'Living Room', slug: 'living-room', parentId: 'furniture-home' },
  { name: 'Bedroom', slug: 'bedroom', parentId: 'furniture-home' },
  { name: 'Kitchen & Dining', slug: 'kitchen-dining', parentId: 'furniture-home' },
  { name: 'Office Furniture', slug: 'office-furniture', parentId: 'furniture-home' },
  { name: 'Home Decor', slug: 'home-decor', parentId: 'furniture-home' },
];

const healthSubs = [
  { name: 'Skincare', slug: 'skincare', parentId: 'health-beauty' },
  { name: 'Hair Care', slug: 'hair-care', parentId: 'health-beauty' },
  { name: 'Fitness & Supplements', slug: 'fitness-supplements', parentId: 'health-beauty' },
  { name: 'Medical Equipment', slug: 'medical-equipment', parentId: 'health-beauty' },
];

const sportsSubs = [
  { name: 'Exercise Equipment', slug: 'exercise-equipment', parentId: 'sports-outdoors' },
  { name: 'Outdoor Gear', slug: 'outdoor-gear', parentId: 'sports-outdoors' },
  { name: 'Team Sports', slug: 'team-sports', parentId: 'sports-outdoors' },
  { name: 'Water Sports', slug: 'water-sports', parentId: 'sports-outdoors' },
];

const businessSubs = [
  { name: 'Industrial Machinery', slug: 'industrial-machinery', parentId: 'business-industrial' },
  { name: 'Office Equipment', slug: 'office-equipment', parentId: 'business-industrial' },
  { name: 'Restaurant & Catering', slug: 'restaurant-catering', parentId: 'business-industrial' },
  { name: 'Construction', slug: 'construction', parentId: 'business-industrial' },
];

const booksSubs = [
  { name: 'Textbooks', slug: 'textbooks', parentId: 'books-media' },
  { name: 'Novels & Fiction', slug: 'novels-fiction', parentId: 'books-media' },
  { name: 'Movies & Music', slug: 'movies-music', parentId: 'books-media' },
  { name: 'Video Games', slug: 'video-games', parentId: 'books-media' },
];

const babySubs = [
  { name: 'Baby Clothing', slug: 'baby-clothing', parentId: 'baby-kids' },
  { name: 'Toys & Games', slug: 'toys-games', parentId: 'baby-kids' },
  { name: 'Baby Gear', slug: 'baby-gear', parentId: 'baby-kids' },
  { name: 'Maternity', slug: 'maternity', parentId: 'baby-kids' },
];

const petsSubs = [
  { name: 'Dogs', slug: 'dogs', parentId: 'pets-animals' },
  { name: 'Cats', slug: 'cats', parentId: 'pets-animals' },
  { name: 'Birds', slug: 'birds', parentId: 'pets-animals' },
  { name: 'Pet Supplies', slug: 'pet-supplies', parentId: 'pets-animals' },
];

const foodSubs = [
  { name: 'Groceries', slug: 'groceries', parentId: 'food-drinks' },
  { name: 'Restaurant Equipment', slug: 'restaurant-equipment', parentId: 'food-drinks' },
  { name: 'Catering', slug: 'catering', parentId: 'food-drinks' },
];

const hobbiesSubs = [
  { name: 'Art Supplies', slug: 'art-supplies', parentId: 'hobbies-crafts' },
  { name: 'Collectibles', slug: 'collectibles', parentId: 'hobbies-crafts' },
  { name: 'Musical Instruments', slug: 'musical-instruments', parentId: 'hobbies-crafts' },
  { name: 'DIY & Tools', slug: 'diy-tools', parentId: 'hobbies-crafts' },
];

const travelSubs = [
  { name: 'Hotels & Lodging', slug: 'hotels-lodging', parentId: 'travel-tourism' },
  { name: 'Tour Packages', slug: 'tour-packages', parentId: 'travel-tourism' },
  { name: 'Flights & Transport', slug: 'flights-transport', parentId: 'travel-tourism' },
];

const locations = [
  { name: 'Nairobi', slug: 'nairobi' },
  { name: 'Mombasa', slug: 'mombasa' },
  { name: 'Kisumu', slug: 'kisumu' },
  { name: 'Nakuru', slug: 'nakuru' },
  { name: 'Eldoret', slug: 'eldoret' },
  { name: 'Thika', slug: 'thika' },
  { name: 'Malindi', slug: 'malindi' },
  { name: 'Kitale', slug: 'kitale' },
  { name: 'Nyeri', slug: 'nyeri' },
  { name: 'Machakos', slug: 'machakos' },
  { name: 'Meru', slug: 'meru' },
  { name: 'Nanyuki', slug: 'nanyuki' },
  { name: 'Kakamega', slug: 'kakamega' },
  { name: 'Garissa', slug: 'garissa' },
  { name: 'Kericho', slug: 'kericho' },
  { name: 'Kajiado', slug: 'kajiado' },
  { name: 'Migori', slug: 'migori' },
  { name: 'Bungoma', slug: 'bungoma' },
  { name: 'Vihiga', slug: 'vihiga' },
];

const sampleListings = [
  {
    title: 'Toyota Corolla 2018 - Low Mileage',
    description: 'Well maintained Toyota Corolla 2018 model with very low mileage. Full service history available. New tyres, AC working perfectly. Accident free. Serious buyers only please.',
    price: 1350000,
    condition: 'Used',
    categorySlug: 'cars',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=600&h=400&fit=crop',
    ]),
    contactName: 'James Mwangi',
    contactPhone: '+254712345678',
    contactEmail: 'james.mwangi@email.com',
    isFeatured: true,
    isNegotiable: true,
  },
  {
    title: '2 Bedroom Apartment in Kilimani',
    description: 'Modern 2-bedroom apartment in Kilimani with stunning views. Features include: swimming pool, gym, 24/7 security, backup generator, and ample parking. Close to Yaya Centre and major malls.',
    price: 85000,
    condition: 'New',
    categorySlug: 'houses-apartments',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
    ]),
    contactName: 'Pamela Properties',
    contactPhone: '+254723456789',
    contactEmail: 'info@pamelaproperties.co.ke',
    isFeatured: true,
    isNegotiable: false,
  },
  {
    title: 'iPhone 15 Pro Max - 256GB',
    description: 'Brand new iPhone 15 Pro Max 256GB Natural Titanium. Factory unlocked, comes with box and all accessories. 1 year Apple warranty. Available for pickup in CBD.',
    price: 145000,
    condition: 'New',
    categorySlug: 'smartphones',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=400&fit=crop',
    ]),
    contactName: 'TechHub Kenya',
    contactPhone: '+254734567890',
    contactEmail: 'sales@techhub.co.ke',
    isFeatured: true,
    isNegotiable: false,
  },
  {
    title: 'MacBook Pro M3 14-inch',
    description: 'Apple MacBook Pro 14-inch with M3 Pro chip, 18GB RAM, 512GB SSD. Space Black color. Barely used, 3 months old. Comes with original charger and box.',
    price: 195000,
    condition: 'Used',
    categorySlug: 'laptops',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop',
    ]),
    contactName: 'Kevin Ochieng',
    contactPhone: '+254745678901',
    isFeatured: true,
    isNegotiable: true,
  },
  {
    title: 'Honda CB500X 2023',
    description: 'Honda CB500X adventure motorcycle, 2023 model. Excellent condition with only 3,000km. Comes with pannier racks, hand guards, and a taller windscreen. Full Honda warranty.',
    price: 620000,
    condition: 'Used',
    categorySlug: 'motorcycles',
    locationSlug: 'mombasa',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop',
    ]),
    contactName: 'Coast Motors',
    contactPhone: '+254756789012',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Samsung 65" Smart TV 4K UHD',
    description: 'Samsung Crystal UHD 65-inch Smart TV. 4K resolution, built-in streaming apps, Dolby Digital Plus. Wall mount included. 2 years Samsung warranty.',
    price: 78000,
    condition: 'New',
    categorySlug: 'tvs-video',
    locationSlug: 'kisumu',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=400&fit=crop',
    ]),
    contactName: 'ElectroWorld Kisumu',
    contactPhone: '+254767890123',
    isFeatured: false,
    isNegotiable: false,
  },
  {
    title: '1 Acre Land in Rongai',
    description: 'Prime 1-acre plot in Rongai, near the new Bypass. Ideal for residential development. All utilities available (water, electricity). Valid title deed, ready for transfer.',
    price: 15000000,
    condition: 'New',
    categorySlug: 'land-plots',
    locationSlug: 'nakuru',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
    ]),
    contactName: 'Homes Kenya Ltd',
    contactPhone: '+254778901234',
    contactEmail: 'sales@homeskenya.co.ke',
    isFeatured: true,
    isNegotiable: true,
  },
  {
    title: 'Leather Office Chair - Premium',
    description: 'High-quality executive leather office chair. Adjustable height, lumbar support, swivel base. Black genuine leather. Perfect for home office or corporate use.',
    price: 18000,
    condition: 'New',
    categorySlug: 'furniture-home',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&h=400&fit=crop',
    ]),
    contactName: 'Furniture Palace',
    contactPhone: '+254789012345',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Graphic Designer Needed - Remote',
    description: 'We are looking for a creative graphic designer to join our team. Must be proficient in Adobe Creative Suite (Photoshop, Illustrator, InDesign). Remote work, competitive salary. Send portfolio and CV.',
    price: 0,
    condition: 'New',
    categorySlug: 'jobs',
    locationSlug: 'nairobi',
    images: JSON.stringify([]),
    contactName: 'Creative Solutions Ltd',
    contactPhone: '+254790123456',
    contactEmail: 'hr@creativesolutions.co.ke',
    isFeatured: false,
    isNegotiable: false,
  },
  {
    title: 'Plumbing & Electrical Services',
    description: 'Professional plumbing and electrical services. Over 15 years experience in residential and commercial projects. Free quotes, fast response time. Licensed and insured.',
    price: 2500,
    condition: 'New',
    categorySlug: 'services',
    locationSlug: 'nairobi',
    images: JSON.stringify([]),
    contactName: 'Peter Kamau',
    contactPhone: '+254701234567',
    isFeatured: false,
    isNegotiable: false,
  },
  {
    title: 'Fresh Dairy Cows for Sale',
    description: 'High-yielding Friesian and Ayrshire dairy cows. Currently producing 25-30 liters per day. Vaccinated and in excellent health. Delivery available within Nairobi and surrounding areas.',
    price: 120000,
    condition: 'Used',
    categorySlug: 'agriculture',
    locationSlug: 'eldoret',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop',
    ]),
    contactName: 'Uasin Gishu Farms',
    contactPhone: '+254712345098',
    isFeatured: true,
    isNegotiable: true,
  },
  {
    title: 'Samsung Galaxy S24 Ultra',
    description: 'Samsung Galaxy S24 Ultra 512GB in Titanium Black. Comes with S-Pen, original box, and all accessories. 6 months old, perfect condition with screen protector and case.',
    price: 105000,
    condition: 'Used',
    categorySlug: 'smartphones',
    locationSlug: 'thika',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop',
    ]),
    contactName: 'Mary Wanjiku',
    contactPhone: '+254722345678',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Men\'s Designer Suits - Collection',
    description: 'Brand new men\'s designer suits collection. Italian fabric, various sizes available (M, L, XL, XXL). Perfect for weddings, corporate events, and special occasions. Wholesale and retail.',
    price: 8500,
    condition: 'New',
    categorySlug: 'fashion',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=400&fit=crop',
    ]),
    contactName: 'Style House Kenya',
    contactPhone: '+254733456789',
    isFeatured: false,
    isNegotiable: false,
  },
  {
    title: 'Commercial Land Along Mombasa Road',
    description: 'Half-acre commercial plot along Mombasa Road, opposite Gateway Mall. Excellent for petrol station, hotel, or retail development. Zoned commercial. All approvals in place.',
    price: 45000000,
    condition: 'New',
    categorySlug: 'land-plots',
    locationSlug: 'machakos',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
    ]),
    contactName: 'Prime Properties',
    contactPhone: '+254744567890',
    contactEmail: 'info@primeproperties.co.ke',
    isFeatured: true,
    isNegotiable: true,
  },
  {
    title: 'Treadmill - ProForm Performance',
    description: 'ProForm Performance 600i treadmill. Barely used, 6 months old. Features: 3.5 CHP motor, 20" x 60" tread belt, iFit compatible, cushioned deck. Must sell - relocating.',
    price: 45000,
    condition: 'Used',
    categorySlug: 'sports-outdoors',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop',
    ]),
    contactName: 'Grace Akinyi',
    contactPhone: '+254755678901',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Isuzu NPR Truck 2021',
    description: 'Isuzu NPR 300 truck, 2021 model. Well maintained, regularly serviced. Low mileage. Ideal for logistics and delivery business. New tyres fitted. Inspection welcome.',
    price: 4800000,
    condition: 'Used',
    categorySlug: 'trucks',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=400&fit=crop',
    ]),
    contactName: 'Auto Dealers Kenya',
    contactPhone: '+254766789012',
    contactEmail: 'sales@autodealers.co.ke',
    isFeatured: true,
    isNegotiable: true,
  },
  {
    title: 'Natural Skincare Products - Wholesale',
    description: 'Premium natural skincare products including shea butter, coconut oil, and aloe vera products. Organic and cruelty-free. Available for wholesale and retail. Great for resellers.',
    price: 3500,
    condition: 'New',
    categorySlug: 'health-beauty',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop',
    ]),
    contactName: 'Natural Glow Kenya',
    contactPhone: '+254777890123',
    isFeatured: false,
    isNegotiable: false,
  },
  {
    title: 'Sony PlayStation 5 + 3 Games',
    description: 'PS5 Disc Edition with 3 games (FIFA 25, Spider-Man 2, Gran Turismo 7). Includes 2 DualSense controllers and charging dock. 8 months old, excellent condition.',
    price: 48000,
    condition: 'Used',
    categorySlug: 'gaming',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop',
    ]),
    contactName: 'Gaming Zone',
    contactPhone: '+254788901234',
    isFeatured: true,
    isNegotiable: true,
  },
  {
    title: '3-Bedroom Bungalow in Nyeri',
    description: 'Spacious 3-bedroom bungalow on a 1/8 acre plot in Nyeri town. Master bedroom en-suite, modern kitchen, perimeter wall, gate. Quiet neighborhood. Title deed available.',
    price: 8500000,
    condition: 'Used',
    categorySlug: 'houses-apartments',
    locationSlug: 'nyeri',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop',
    ]),
    contactName: 'Central Kenya Homes',
    contactPhone: '+254799012345',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Desktop Computer - Core i7, 16GB RAM',
    description: 'Custom built desktop computer. Intel Core i7-13700K, 16GB DDR5 RAM, 512GB NVMe SSD, RTX 4060 8GB. Perfect for video editing, gaming, and heavy workloads.',
    price: 95000,
    condition: 'New',
    categorySlug: 'electronics',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=400&fit=crop',
    ]),
    contactName: 'PC Masters',
    contactPhone: '+254709123456',
    contactEmail: 'info@pcmasters.co.ke',
    isFeatured: false,
    isNegotiable: false,
  },
  {
    title: 'Toyota Hiace Van 2020',
    description: 'Toyota Hiace DX van 2020 model. Perfect for transport business, delivery services, or conversion to a campervan. Well maintained with full service history.',
    price: 2800000,
    condition: 'Used',
    categorySlug: 'trucks',
    locationSlug: 'eldoret',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    ]),
    contactName: 'Rift Valley Motors',
    contactPhone: '+254718234567',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Beachfront Plot in Malindi',
    description: '1/4 acre beachfront plot in Malindi, 100 meters from the ocean. Ideal for a private villa or boutique hotel. Accessible road, electricity and water available. Clean title deed.',
    price: 28000000,
    condition: 'New',
    categorySlug: 'land-plots',
    locationSlug: 'malindi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    ]),
    contactName: 'Coastline Properties',
    contactPhone: '+254728345678',
    contactEmail: 'info@coastlineproperties.co.ke',
    isFeatured: true,
    isNegotiable: true,
  },
  {
    title: 'Accountant / Bookkeeper Services',
    description: 'Professional accounting and bookkeeping services for SMEs. KRA returns, payroll, financial statements, and tax advisory. Affordable rates. Over 10 years experience.',
    price: 15000,
    condition: 'New',
    categorySlug: 'services',
    locationSlug: 'nairobi',
    images: JSON.stringify([]),
    contactName: 'John Kariuki CPA',
    contactPhone: '+254738456789',
    contactEmail: 'john.kariuki@email.com',
    isFeatured: false,
    isNegotiable: false,
  },
  {
    title: 'Samsung Galaxy Tab S9 FE',
    description: 'Samsung Galaxy Tab S9 FE 128GB with S-Pen. Gray color, 6 months old. Excellent condition with screen protector. Comes with original box and charger.',
    price: 42000,
    condition: 'Used',
    categorySlug: 'tablets',
    locationSlug: 'kisumu',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop',
    ]),
    contactName: 'Dennis Omondi',
    contactPhone: '+254748567890',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Women\'s Designer Handbag - Michael Kors',
    description: 'Authentic Michael Kors Jet Set tote bag. Large size, Saffiano leather. Perfect for work or travel. Comes with dust bag. Used only twice, like new condition.',
    price: 28000,
    condition: 'Used',
    categorySlug: 'bags-accessories',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=400&fit=crop',
    ]),
    contactName: 'Fashion Hub',
    contactPhone: '+254759678901',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Rolex Submariner Date Watch',
    description: 'Genuine Rolex Submariner Date 41mm stainless steel. Black dial, ceramic bezel. Full set with box and papers. 2022 purchase, unworn condition. Serious inquiries only.',
    price: 1250000,
    condition: 'New',
    categorySlug: 'watches',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
    ]),
    contactName: 'Elite Timepieces',
    contactPhone: '+254768789012',
    contactEmail: 'sales@elitetimepieces.co.ke',
    isFeatured: true,
    isNegotiable: false,
  },
  {
    title: 'Full Stack Developer Position',
    description: 'Leading fintech company hiring Senior Full Stack Developer. React, Node.js, PostgreSQL, AWS experience required. Competitive salary + equity. Remote-first culture. 5+ years experience.',
    price: 180000,
    condition: 'New',
    categorySlug: 'full-time',
    locationSlug: 'nairobi',
    images: JSON.stringify([]),
    contactName: 'TechStart Kenya',
    contactPhone: '+254778901234',
    contactEmail: 'careers@techstart.co.ke',
    isFeatured: false,
    isNegotiable: false,
  },
  {
    title: 'Professional Photography Services',
    description: 'Wedding, corporate events, portraits, and product photography. 10+ years experience. Professional equipment, same-day editing available. Packages from KES 50,000. View portfolio on website.',
    price: 50000,
    condition: 'New',
    categorySlug: 'events-photography',
    locationSlug: 'mombasa',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
    ]),
    contactName: 'ShutterPro Studios',
    contactPhone: '+254789012345',
    contactEmail: 'bookings@shutterpro.co.ke',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Purebred German Shepherd Puppies',
    description: 'KC registered German Shepherd puppies, 8 weeks old. Vaccinated, dewormed, microchipped. Parents hip/elbow scored. Excellent bloodlines for family or protection. 3 males, 2 females available.',
    price: 65000,
    condition: 'New',
    categorySlug: 'dogs',
    locationSlug: 'nakuru',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1589941013453-ec89f0a4b120?w=600&h=400&fit=crop',
    ]),
    contactName: 'Kenya K9 Breeders',
    contactPhone: '+254790123456',
    isFeatured: true,
    isNegotiable: false,
  },
  {
    title: 'Baby Stroller - Bugaboo Fox 3',
    description: 'Bugaboo Fox 3 complete stroller in Midnight Black. All-terrain wheels, one-piece fold, adjustable handlebar. Includes bassinet, seat, rain cover, and adapters. 6 months old, excellent condition.',
    price: 55000,
    condition: 'Used',
    categorySlug: 'baby-gear',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1555844222-e81ae5d9c4b0?w=600&h=400&fit=crop',
    ]),
    contactName: 'Grace Mutua',
    contactPhone: '+254701234567',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Acoustic Guitar - Yamaha FG800',
    description: 'Yamaha FG800 solid top acoustic guitar. Spruce top, nato/okume back and sides. Excellent sound quality for beginners and intermediates. Includes gig bag, tuner, and extra strings.',
    price: 18500,
    condition: 'Used',
    categorySlug: 'musical-instruments',
    locationSlug: 'kisumu',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop',
    ]),
    contactName: 'Music World Kisumu',
    contactPhone: '+254712345678',
    isFeatured: false,
    isNegotiable: true,
  },
  {
    title: 'Safari Package - Masai Mara 3 Days',
    description: 'All-inclusive 3-day Masai Mara safari package. Luxury tented camp accommodation, all meals, game drives with professional guide, park fees, transport from Nairobi. Departures every Friday.',
    price: 185000,
    condition: 'New',
    categorySlug: 'tour-packages',
    locationSlug: 'nairobi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop',
    ]),
    contactName: 'Wild Kenya Safaris',
    contactPhone: '+254723456789',
    contactEmail: 'bookings@wildkenyasafaris.co.ke',
    isFeatured: true,
    isNegotiable: false,
  },
];

function makeSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7);
}

async function seed() {
  console.log('🌱 Seeding database...');

  // Clean slate for data that gets recreated each run
  await db.listingImage.deleteMany();
  await db.listing.deleteMany();
  await db.faq.deleteMany();
  await db.blogPost.deleteMany();

  // Upsert plans
  const plans = [
    { name: 'Free', slug: 'free', description: 'Get started with basic features', price: 0, currency: 'KES', interval: 'monthly', features: JSON.stringify({ maxListings: 5, maxImages: 5, maxVideos: 0, featured: false, boost: false }), maxListings: 5, maxImages: 5, maxVideos: 0, isFeatured: false, isPromoted: false, isActive: true, order: 1 },
    { name: 'Premium', slug: 'premium', description: 'For serious sellers who want more exposure', price: 999, currency: 'KES', interval: 'monthly', features: JSON.stringify({ maxListings: 50, maxImages: 10, maxVideos: 3, featured: true, boost: true }), maxListings: 50, maxImages: 10, maxVideos: 3, isFeatured: true, isPromoted: true, isActive: true, order: 2 },
    { name: 'Business', slug: 'business', description: 'Unlimited power for businesses', price: 4999, currency: 'KES', interval: 'monthly', features: JSON.stringify({ maxListings: -1, maxImages: 20, maxVideos: 10, featured: true, boost: true, storefront: true }), maxListings: -1, maxImages: 20, maxVideos: 10, isFeatured: true, isPromoted: true, isActive: true, order: 3 },
  ];
  for (const plan of plans) {
    await db.plan.upsert({ where: { slug: plan.slug }, update: plan, create: plan });
    console.log(`  Upserted plan: ${plan.name}`);
  }

  // Upsert categories (parents first, then children)
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await db.category.upsert({ where: { slug: cat.slug }, update: cat, create: cat });
    categoryMap[cat.slug] = created.id;
    console.log(`  Upserted category: ${cat.name}`);
  }
  const allSubs = [...vehicleSubs, ...propertySubs, ...electronicsSubs, ...phoneSubs, ...fashionSubs, ...jobsSubs, ...servicesSubs, ...agricultureSubs, ...furnitureSubs, ...healthSubs, ...sportsSubs, ...businessSubs, ...booksSubs, ...babySubs, ...petsSubs, ...foodSubs, ...hobbiesSubs, ...travelSubs];
  for (const sub of allSubs) {
    const parentId = categoryMap[sub.parentId];
    if (parentId) {
      const created = await db.category.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, icon: '', parentId },
        create: { name: sub.name, slug: sub.slug, icon: '', parentId },
      });
      categoryMap[sub.slug] = created.id;
      console.log(`  Upserted subcategory: ${sub.name}`);
    }
  }

  // Upsert locations
  const locationMap: Record<string, string> = {};
  for (const loc of locations) {
    const created = await db.location.upsert({ where: { slug: loc.slug }, update: loc, create: loc });
    locationMap[loc.slug] = created.id;
    console.log(`  Upserted location: ${loc.name}`);
  }

  // Generate real password hashes for demo users
  const hashPassword = (await import('./src/lib/auth')).hashPassword;
  const adminHash = await hashPassword('admin123');
  const sellerHash = await hashPassword('seller123');

  // Upsert demo admin user
  const adminUser = await db.user.upsert({
    where: { email: 'admin@chapke.co.ke' },
    update: { passwordHash: adminHash, role: 'admin', isEmailVerified: true, isVerified: true },
    create: { name: 'Admin', email: 'admin@chapke.co.ke', passwordHash: adminHash, role: 'admin', isEmailVerified: true, isVerified: true },
  });
  console.log('  Upserted admin: admin@chapke.co.ke / admin123');

  // Upsert demo seller
  const sellerUser = await db.user.upsert({
    where: { email: 'james@example.com' },
    update: { passwordHash: sellerHash, phone: '+254712345678', role: 'seller', isEmailVerified: true, isPhoneVerified: true, isVerified: true },
    create: { name: 'James Mwangi', email: 'james@example.com', phone: '+254712345678', passwordHash: sellerHash, role: 'seller', isEmailVerified: true, isPhoneVerified: true, isVerified: true },
  });
  console.log('  Upserted seller: james@example.com / seller123');

  // Upsert seller stats
  await db.sellerStats.upsert({
    where: { userId: sellerUser.id },
    update: { totalViews: 1250, totalLeads: 45, totalMessages: 89, avgRating: 4.7, totalReviews: 12, responseTime: 2.5, responseRate: 95 },
    create: { userId: sellerUser.id, totalViews: 1250, totalLeads: 45, totalMessages: 89, avgRating: 4.7, totalReviews: 12, responseTime: 2.5, responseRate: 95 },
  });

  // Create listings + images
  for (const listing of sampleListings) {
    const categoryId = categoryMap[listing.categorySlug];
    const locationId = locationMap[listing.locationSlug];
    if (categoryId && locationId) {
      const slug = makeSlug(listing.title);
      const urlArray: string[] = JSON.parse(listing.images || '[]');
      const created = await db.listing.create({
        data: {
          title: listing.title, slug, description: listing.description,
          price: listing.price, condition: listing.condition,
          categoryId, locationId, userId: sellerUser.id,
          status: 'active',
          contactName: listing.contactName, contactPhone: listing.contactPhone,
          contactEmail: listing.contactEmail || '',
          isFeatured: listing.isFeatured, isNegotiable: listing.isNegotiable,
          publishedAt: new Date(),
          images: {
            create: urlArray.map((url, i) => ({ url, alt: `${listing.title} - Image ${i + 1}`, order: i })),
          },
        },
      });
      console.log(`  Created listing: ${listing.title} (${urlArray.length} images)`);
    }
  }

  // Create FAQs (delete & recreate for freshness)
  const faqs = [
    { question: 'How do I post an ad?', answer: 'Click the "Post Ad" button, fill in the details, upload photos, and publish. It takes less than a minute!', category: 'Getting Started', order: 1 },
    { question: 'Is it free to list?', answer: 'Yes! Free plan allows up to 5 active listings. Upgrade to Premium or Business for more features.', category: 'Pricing', order: 2 },
    { question: 'How do I contact a seller?', answer: 'Click on any listing and use the Call, WhatsApp, or Email buttons to reach the seller directly.', category: 'Buying', order: 3 },
    { question: 'How do I report a suspicious listing?', answer: 'Click the report button on any listing and select the reason. Our team reviews reports within 24 hours.', category: 'Safety', order: 4 },
    { question: 'What payment methods are accepted?', answer: 'We accept M-Pesa, Stripe, Flutterwave, Paystack, and PayPal for Premium subscriptions and featured listings.', category: 'Pricing', order: 5 },
    { question: 'Can I edit my listing after posting?', answer: 'Yes! Go to your Dashboard > My Listings and click Edit on any listing.', category: 'Managing Listings', order: 6 },
  ];
  for (const faq of faqs) {
    await db.faq.create({ data: faq });
  }
  console.log('  Created FAQs');

  // Upsert blog post
  await db.blogPost.upsert({
    where: { slug: 'welcome-to-chapke' },
    update: { updatedAt: new Date() },
    create: {
      title: 'Welcome to ChapKE - Kenya\'s Premier Marketplace', slug: 'welcome-to-chapke',
      content: '# Welcome to ChapKE!\n\nChapKE is Kenya\'s most trusted digital marketplace. Whether you\'re buying or selling, we provide a safe, fast, and free platform to connect with thousands of Kenyans.\n\n## Why ChapKE?\n\n- **Free to list** - Post your first 5 ads for free\n- **Wide reach** - Reach buyers across all 47 counties\n- **Safe trading** - Verified sellers and safety tips\n- **Easy payments** - M-Pesa, Stripe, and more\n\n## Getting Started\n\n1. Create an account\n2. Post your first listing\n3. Connect with buyers\n4. Close the deal!\n\nStart selling on ChapKE today!',
      excerpt: 'Discover ChapKE, Kenya\'s most trusted digital marketplace for buying and selling.',
      authorName: 'ChapKE Team', category: 'Announcements', status: 'published',
      publishedAt: new Date(),
      seoTitle: 'Welcome to ChapKE - Kenya\'s Premier Marketplace',
      seoDesc: 'Discover ChapKE, Kenya\'s most trusted digital marketplace for buying and selling vehicles, property, electronics, and more.',
    },
  });
  console.log('  Upserted sample blog post');

  console.log('✅ Seeding complete!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });