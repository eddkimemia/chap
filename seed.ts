import { db } from './src/lib/db';

const categories = [
  { name: 'Vehicles', slug: 'vehicles', icon: 'car', order: 1 },
  { name: 'Property', slug: 'property', icon: 'home', order: 2 },
  { name: 'Electronics', slug: 'electronics', icon: 'monitor', order: 3 },
  { name: 'Phones & Tablets', slug: 'phones-tablets', icon: 'smartphone', order: 4 },
  { name: 'Fashion', slug: 'fashion', icon: 'shirt', order: 5 },
  { name: 'Jobs', slug: 'jobs', icon: 'briefcase', order: 6 },
  { name: 'Services', slug: 'services', icon: 'wrench', order: 7 },
  { name: 'Agriculture & Food', slug: 'agriculture-food', icon: 'trees', order: 8 },
  { name: 'Furniture & Home', slug: 'furniture-home', icon: 'sofa', order: 9 },
  { name: 'Health & Beauty', slug: 'health-beauty', icon: 'heart', order: 10 },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: 'dumbbell', order: 11 },
  { name: 'Business & Industrial', slug: 'business-industrial', icon: 'building', order: 12 },
  { name: 'Books, Media & Entertainment', slug: 'books-media', icon: 'book', order: 13 },
  { name: 'Baby & Kids', slug: 'baby-kids', icon: 'baby', order: 14 },
  { name: 'Pets & Animals', slug: 'pets-animals', icon: 'paw-print', order: 15 },
  { name: 'Food & Drinks', slug: 'food-drinks', icon: 'utensils', order: 16 },
  { name: 'Hobbies, Sports & Arts', slug: 'hobbies-arts', icon: 'palette', order: 17 },
  { name: 'Travel & Tourism', slug: 'travel-tourism', icon: 'plane', order: 18 },
];

const vehicleSubs = [
  { name: 'Cars', slug: 'cars', parentId: 'vehicles' },
  { name: 'Station Wagons', slug: 'station-wagons', parentId: 'vehicles' },
  { name: 'SUVs & Crossovers', slug: 'suvs-crossovers', parentId: 'vehicles' },
  { name: 'Pickup Trucks', slug: 'pickup-trucks', parentId: 'vehicles' },
  { name: 'Motorcycles & Scooters', slug: 'motorcycles', parentId: 'vehicles' },
  { name: 'Trucks & Trailers', slug: 'trucks', parentId: 'vehicles' },
  { name: 'Buses & Matatus', slug: 'buses-matatus', parentId: 'vehicles' },
  { name: 'Heavy Equipment', slug: 'heavy-equipment', parentId: 'vehicles' },
  { name: 'Boats & Watercraft', slug: 'boats-watercraft', parentId: 'vehicles' },
  { name: 'Vehicle Parts & Accessories', slug: 'vehicle-parts', parentId: 'vehicles' },
  { name: 'Car Audio & Electronics', slug: 'car-audio', parentId: 'vehicles' },
  { name: 'Car Care & Detailing', slug: 'car-care', parentId: 'vehicles' },
  { name: 'Auto Services & Repairs', slug: 'auto-services', parentId: 'vehicles' },
  { name: 'Number Plates & Documents', slug: 'number-plates', parentId: 'vehicles' },
];

const propertySubs = [
  { name: 'Houses for Rent', slug: 'houses-rent', parentId: 'property' },
  { name: 'Apartments for Rent', slug: 'apartments-rent', parentId: 'property' },
  { name: 'Houses for Sale', slug: 'houses-sale', parentId: 'property' },
  { name: 'Apartments for Sale', slug: 'apartments-sale', parentId: 'property' },
  { name: 'Land & Plots', slug: 'land-plots', parentId: 'property' },
  { name: 'Commercial Property', slug: 'commercial-property', parentId: 'property' },
  { name: 'Office Space', slug: 'office-space', parentId: 'property' },
  { name: 'Short-Term Rentals', slug: 'short-term-rentals', parentId: 'property' },
  { name: 'Warehouses & Storage', slug: 'warehouses-storage', parentId: 'property' },
  { name: 'Parking Spaces', slug: 'parking-spaces', parentId: 'property' },
  { name: 'Farm Land', slug: 'farm-land', parentId: 'property' },
  { name: 'Townhouses', slug: 'townhouses', parentId: 'property' },
];

const electronicsSubs = [
  { name: 'Laptops', slug: 'laptops', parentId: 'electronics' },
  { name: 'Desktop Computers', slug: 'desktop-computers', parentId: 'electronics' },
  { name: 'Computer Accessories', slug: 'computer-accessories', parentId: 'electronics' },
  { name: 'TVs & Video', slug: 'tvs-video', parentId: 'electronics' },
  { name: 'Cameras & Photography', slug: 'cameras', parentId: 'electronics' },
  { name: 'Audio & Speakers', slug: 'audio-speakers', parentId: 'electronics' },
  { name: 'Gaming Consoles & Gear', slug: 'gaming', parentId: 'electronics' },
  { name: 'Smart Home Devices', slug: 'smart-home', parentId: 'electronics' },
  { name: 'Networking & Routers', slug: 'networking', parentId: 'electronics' },
  { name: 'Wearable Technology', slug: 'wearables', parentId: 'electronics' },
  { name: 'Drones & Accessories', slug: 'drones', parentId: 'electronics' },
  { name: 'Printers & Scanners', slug: 'printers-scanners', parentId: 'electronics' },
  { name: 'Monitors & Screens', slug: 'monitors', parentId: 'electronics' },
  { name: 'Projectors', slug: 'projectors', parentId: 'electronics' },
];

const phoneSubs = [
  { name: 'Smartphones', slug: 'smartphones', parentId: 'phones-tablets' },
  { name: 'Feature Phones', slug: 'feature-phones', parentId: 'phones-tablets' },
  { name: 'Tablets', slug: 'tablets', parentId: 'phones-tablets' },
  { name: 'Phone Cases & Covers', slug: 'phone-cases', parentId: 'phones-tablets' },
  { name: 'Screen Protectors', slug: 'screen-protectors', parentId: 'phones-tablets' },
  { name: 'Chargers & Cables', slug: 'chargers-cables', parentId: 'phones-tablets' },
  { name: 'Power Banks', slug: 'power-banks', parentId: 'phones-tablets' },
  { name: 'Headphones & Earphones', slug: 'headphones', parentId: 'phones-tablets' },
  { name: 'Phone Parts & Repairs', slug: 'phone-parts', parentId: 'phones-tablets' },
  { name: 'Smartwatches', slug: 'smartwatches', parentId: 'phones-tablets' },
  { name: 'SIM Cards & Airtime', slug: 'sim-cards', parentId: 'phones-tablets' },
];

const fashionSubs = [
  { name: "Men's Clothing", slug: 'mens-clothing', parentId: 'fashion' },
  { name: "Women's Clothing", slug: 'womens-clothing', parentId: 'fashion' },
  { name: "Men's Shoes", slug: 'mens-shoes', parentId: 'fashion' },
  { name: "Women's Shoes", slug: 'womens-shoes', parentId: 'fashion' },
  { name: "Children's Clothing", slug: 'kids-clothing', parentId: 'fashion' },
  { name: 'Traditional Wear', slug: 'traditional-wear', parentId: 'fashion' },
  { name: 'Kitenge & African Fabric', slug: 'kitenge-fabric', parentId: 'fashion' },
  { name: 'Watches', slug: 'watches', parentId: 'fashion' },
  { name: 'Jewelry & Accessories', slug: 'jewelry', parentId: 'fashion' },
  { name: 'Bags & Luggage', slug: 'bags-accessories', parentId: 'fashion' },
  { name: 'Sunglasses & Eyewear', slug: 'sunglasses', parentId: 'fashion' },
  { name: 'Hats & Caps', slug: 'hats-caps', parentId: 'fashion' },
  { name: 'Belts & Wallets', slug: 'belts-wallets', parentId: 'fashion' },
  { name: 'Second-hand (Mitumba)', slug: 'mitumba', parentId: 'fashion' },
  { name: 'Wedding & Bridal', slug: 'wedding-bridal', parentId: 'fashion' },
  { name: 'Uniforms & Workwear', slug: 'uniforms-workwear', parentId: 'fashion' },
];

const jobsSubs = [
  { name: 'Full Time', slug: 'full-time', parentId: 'jobs' },
  { name: 'Part Time', slug: 'part-time', parentId: 'jobs' },
  { name: 'Contract', slug: 'contract', parentId: 'jobs' },
  { name: 'Internship & Attachment', slug: 'internship', parentId: 'jobs' },
  { name: 'Freelance & Remote', slug: 'freelance', parentId: 'jobs' },
  { name: 'Volunteer', slug: 'volunteer', parentId: 'jobs' },
  { name: 'Graduate Trainee', slug: 'graduate-trainee', parentId: 'jobs' },
  { name: 'Accounting & Finance', slug: 'jobs-accounting', parentId: 'jobs' },
  { name: 'Administration & Office', slug: 'jobs-admin', parentId: 'jobs' },
  { name: 'Agriculture & Farming', slug: 'jobs-agriculture', parentId: 'jobs' },
  { name: 'Banking & Insurance', slug: 'jobs-banking', parentId: 'jobs' },
  { name: 'Construction & Trades', slug: 'jobs-construction', parentId: 'jobs' },
  { name: 'Education & Teaching', slug: 'jobs-education', parentId: 'jobs' },
  { name: 'Healthcare & Medical', slug: 'jobs-healthcare', parentId: 'jobs' },
  { name: 'Hospitality & Tourism', slug: 'jobs-hospitality', parentId: 'jobs' },
  { name: 'IT & Software', slug: 'jobs-it', parentId: 'jobs' },
  { name: 'Manufacturing', slug: 'jobs-manufacturing', parentId: 'jobs' },
  { name: 'Marketing & Sales', slug: 'jobs-marketing', parentId: 'jobs' },
  { name: 'Security & Guarding', slug: 'jobs-security', parentId: 'jobs' },
  { name: 'Transport & Logistics', slug: 'jobs-transport', parentId: 'jobs' },
];

const servicesSubs = [
  { name: 'Home Cleaning', slug: 'home-cleaning', parentId: 'services' },
  { name: 'Plumbing Services', slug: 'plumbing', parentId: 'services' },
  { name: 'Electrical Services', slug: 'electrical', parentId: 'services' },
  { name: 'Painting & Decorating', slug: 'painting-decorating', parentId: 'services' },
  { name: 'Moving & Relocation', slug: 'moving-relocation', parentId: 'services' },
  { name: 'Carpentry & Furniture', slug: 'carpentry', parentId: 'services' },
  { name: 'IT & Web Development', slug: 'it-web', parentId: 'services' },
  { name: 'Graphic Design & Media', slug: 'graphic-design', parentId: 'services' },
  { name: 'Photography & Videography', slug: 'photography', parentId: 'services' },
  { name: 'Events Planning & Catering', slug: 'events-catering', parentId: 'services' },
  { name: 'Beauty & Salon Services', slug: 'beauty-salon', parentId: 'services' },
  { name: 'Barber & Grooming', slug: 'barber-grooming', parentId: 'services' },
  { name: 'Massage & Spa', slug: 'massage-spa', parentId: 'services' },
  { name: 'Tutoring & Lessons', slug: 'tutoring-lessons', parentId: 'services' },
  { name: 'Legal Services', slug: 'legal-services', parentId: 'services' },
  { name: 'Accounting & Tax', slug: 'accounting-tax', parentId: 'services' },
  { name: 'Real Estate Agents', slug: 'real-estate-agents', parentId: 'services' },
  { name: 'Delivery & Courier', slug: 'delivery-courier', parentId: 'services' },
  { name: 'Mobile Money Services', slug: 'mobile-money', parentId: 'services' },
  { name: 'Car Wash & Detailing', slug: 'car-wash', parentId: 'services' },
  { name: 'Fitness Training', slug: 'fitness-training', parentId: 'services' },
  { name: 'Security Services', slug: 'security-services', parentId: 'services' },
  { name: 'Printing & Publishing', slug: 'printing-publishing', parentId: 'services' },
  { name: 'Tailoring & Alterations', slug: 'tailoring', parentId: 'services' },
];

const agricultureSubs = [
  { name: 'Farm Machinery & Tools', slug: 'farm-machinery', parentId: 'agriculture-food' },
  { name: 'Tractors & Harvesters', slug: 'tractors', parentId: 'agriculture-food' },
  { name: 'Cattle & Livestock', slug: 'livestock', parentId: 'agriculture-food' },
  { name: 'Poultry & Chicken', slug: 'poultry', parentId: 'agriculture-food' },
  { name: 'Goats & Sheep', slug: 'goats-sheep', parentId: 'agriculture-food' },
  { name: 'Pigs & Piglets', slug: 'pigs', parentId: 'agriculture-food' },
  { name: 'Fish & Aquaculture', slug: 'fish-aquaculture', parentId: 'agriculture-food' },
  { name: 'Seeds & Seedlings', slug: 'seeds-seedlings', parentId: 'agriculture-food' },
  { name: 'Fertilizers & Soil inputs', slug: 'fertilizers', parentId: 'agriculture-food' },
  { name: 'Animal Feeds & Supplements', slug: 'animal-feeds', parentId: 'agriculture-food' },
  { name: 'Fresh Produce', slug: 'fresh-produce', parentId: 'agriculture-food' },
  { name: 'Greenhouse & Irrigation', slug: 'greenhouse-irrigation', parentId: 'agriculture-food' },
  { name: 'Bee Keeping', slug: 'bee-keeping', parentId: 'agriculture-food' },
  { name: 'Farm Land & Ranches', slug: 'farm-land-agri', parentId: 'agriculture-food' },
  { name: 'Agrochemicals', slug: 'agrochemicals', parentId: 'agriculture-food' },
];

const furnitureSubs = [
  { name: 'Living Room Sets', slug: 'living-room-sets', parentId: 'furniture-home' },
  { name: 'Sofas & Couches', slug: 'sofas-couches', parentId: 'furniture-home' },
  { name: 'Tables & Coffee Tables', slug: 'tables', parentId: 'furniture-home' },
  { name: 'Chairs & Seating', slug: 'chairs-seating', parentId: 'furniture-home' },
  { name: 'Bedroom Furniture', slug: 'bedroom', parentId: 'furniture-home' },
  { name: 'Beds & Mattresses', slug: 'beds-mattresses', parentId: 'furniture-home' },
  { name: 'Wardrobes & Dressers', slug: 'wardrobes', parentId: 'furniture-home' },
  { name: 'Kitchen & Dining', slug: 'kitchen-dining', parentId: 'furniture-home' },
  { name: 'Office Furniture', slug: 'office-furniture', parentId: 'furniture-home' },
  { name: 'Home Decor & Accessories', slug: 'home-decor', parentId: 'furniture-home' },
  { name: 'Curtains & Blinds', slug: 'curtains-blinds', parentId: 'furniture-home' },
  { name: 'Carpets & Rugs', slug: 'carpets-rugs', parentId: 'furniture-home' },
  { name: 'Lighting & Lamps', slug: 'lighting-lamps', parentId: 'furniture-home' },
  { name: 'Storage & Shelving', slug: 'storage-shelving', parentId: 'furniture-home' },
  { name: 'Garden & Outdoor', slug: 'garden-outdoor', parentId: 'furniture-home' },
  { name: 'Bedding & Linens', slug: 'bedding-linens', parentId: 'furniture-home' },
];

const healthSubs = [
  { name: 'Skincare & Lotions', slug: 'skincare', parentId: 'health-beauty' },
  { name: 'Hair Care & Styling', slug: 'hair-care', parentId: 'health-beauty' },
  { name: 'Makeup & Cosmetics', slug: 'makeup-cosmetics', parentId: 'health-beauty' },
  { name: 'Perfumes & Fragrances', slug: 'perfumes', parentId: 'health-beauty' },
  { name: 'Fitness & Supplements', slug: 'fitness-supplements', parentId: 'health-beauty' },
  { name: 'Medical Equipment', slug: 'medical-equipment', parentId: 'health-beauty' },
  { name: 'Natural & Organic Products', slug: 'natural-organic', parentId: 'health-beauty' },
  { name: 'Nail Care & Manicure', slug: 'nail-care', parentId: 'health-beauty' },
  { name: 'Men\'s Grooming', slug: 'mens-grooming', parentId: 'health-beauty' },
  { name: 'Baby Care Products', slug: 'baby-care-products', parentId: 'health-beauty' },
  { name: 'Maternity Care', slug: 'maternity-care', parentId: 'health-beauty' },
  { name: 'Orthopedic & Mobility', slug: 'orthopedic', parentId: 'health-beauty' },
];

const sportsSubs = [
  { name: 'Exercise & Gym Equipment', slug: 'exercise-equipment', parentId: 'sports-outdoors' },
  { name: 'Fitness Wear & Gear', slug: 'fitness-wear', parentId: 'sports-outdoors' },
  { name: 'Camping & Hiking', slug: 'camping-hiking', parentId: 'sports-outdoors' },
  { name: 'Cycling & Bicycles', slug: 'cycling-bicycles', parentId: 'sports-outdoors' },
  { name: 'Football & Rugby', slug: 'football-rugby', parentId: 'sports-outdoors' },
  { name: 'Basketball & Netball', slug: 'basketball-netball', parentId: 'sports-outdoors' },
  { name: 'Swimming & Water Sports', slug: 'swimming-water-sports', parentId: 'sports-outdoors' },
  { name: 'Running & Athletics', slug: 'running-athletics', parentId: 'sports-outdoors' },
  { name: 'Martial Arts & Boxing', slug: 'martial-arts-boxing', parentId: 'sports-outdoors' },
  { name: 'Tennis & Badminton', slug: 'tennis-badminton', parentId: 'sports-outdoors' },
  { name: 'Fishing Gear', slug: 'fishing-gear', parentId: 'sports-outdoors' },
  { name: 'Outdoor Games', slug: 'outdoor-games', parentId: 'sports-outdoors' },
];

const businessSubs = [
  { name: 'Industrial Machinery', slug: 'industrial-machinery', parentId: 'business-industrial' },
  { name: 'Manufacturing Equipment', slug: 'manufacturing-equipment', parentId: 'business-industrial' },
  { name: 'Office Equipment & Supplies', slug: 'office-equipment', parentId: 'business-industrial' },
  { name: 'Restaurant & Catering Equipment', slug: 'restaurant-equipment', parentId: 'business-industrial' },
  { name: 'Construction Equipment', slug: 'construction-equipment', parentId: 'business-industrial' },
  { name: 'Packaging & Labeling', slug: 'packaging-labeling', parentId: 'business-industrial' },
  { name: 'Safety & Security', slug: 'safety-security', parentId: 'business-industrial' },
  { name: 'Cleaning Equipment', slug: 'cleaning-equipment', parentId: 'business-industrial' },
  { name: 'Retail & Shop Equipment', slug: 'retail-shop', parentId: 'business-industrial' },
  { name: 'Business for Sale', slug: 'business-for-sale', parentId: 'business-industrial' },
  { name: 'Franchise Opportunities', slug: 'franchise', parentId: 'business-industrial' },
  { name: 'Raw Materials', slug: 'raw-materials', parentId: 'business-industrial' },
];

const booksSubs = [
  { name: 'Textbooks & Academic', slug: 'textbooks-academic', parentId: 'books-media' },
  { name: 'Novels & Fiction', slug: 'novels-fiction', parentId: 'books-media' },
  { name: 'Children\'s Books', slug: 'childrens-books', parentId: 'books-media' },
  { name: 'Religion & Spiritual', slug: 'religion-spiritual', parentId: 'books-media' },
  { name: 'Business & Self-Help', slug: 'business-selfhelp', parentId: 'books-media' },
  { name: 'Magazines & Journals', slug: 'magazines-journals', parentId: 'books-media' },
  { name: 'Comics & Graphic Novels', slug: 'comics-graphic', parentId: 'books-media' },
  { name: 'Movies & DVDs', slug: 'movies-dvds', parentId: 'books-media' },
  { name: 'Music & CDs', slug: 'music-cds', parentId: 'books-media' },
  { name: 'Video Games & Consoles', slug: 'video-games', parentId: 'books-media' },
  { name: 'Board Games & Puzzles', slug: 'board-games', parentId: 'books-media' },
  { name: 'E-books & Digital', slug: 'ebooks-digital', parentId: 'books-media' },
];

const babySubs = [
  { name: 'Baby Clothing', slug: 'baby-clothing', parentId: 'baby-kids' },
  { name: 'Baby Footwear', slug: 'baby-footwear', parentId: 'baby-kids' },
  { name: 'Toys & Games', slug: 'toys-games', parentId: 'baby-kids' },
  { name: 'Baby Gear & Equipment', slug: 'baby-gear', parentId: 'baby-kids' },
  { name: 'Strollers & Prams', slug: 'strollers-prams', parentId: 'baby-kids' },
  { name: 'Car Seats & Safety', slug: 'car-seats', parentId: 'baby-kids' },
  { name: 'Cribs & Nursery Furniture', slug: 'cribs-nursery', parentId: 'baby-kids' },
  { name: 'Diapers & Changing', slug: 'diapers-changing', parentId: 'baby-kids' },
  { name: 'Feeding & Nursing', slug: 'feeding-nursing', parentId: 'baby-kids' },
  { name: 'Maternity Wear', slug: 'maternity', parentId: 'baby-kids' },
  { name: 'Kids\' Furniture', slug: 'kids-furniture', parentId: 'baby-kids' },
  { name: 'Educational Toys', slug: 'educational-toys', parentId: 'baby-kids' },
  { name: 'School Supplies', slug: 'school-supplies', parentId: 'baby-kids' },
];

const petsSubs = [
  { name: 'Dogs & Puppies', slug: 'dogs', parentId: 'pets-animals' },
  { name: 'Cats & Kittens', slug: 'cats', parentId: 'pets-animals' },
  { name: 'Birds & Parrots', slug: 'birds', parentId: 'pets-animals' },
  { name: 'Fish & Aquariums', slug: 'fish-aquariums', parentId: 'pets-animals' },
  { name: 'Rabbits & Rodents', slug: 'rabbits-rodents', parentId: 'pets-animals' },
  { name: 'Horses & Donkeys', slug: 'horses-donkeys', parentId: 'pets-animals' },
  { name: 'Pet Food & Supplies', slug: 'pet-supplies', parentId: 'pets-animals' },
  { name: 'Pet Grooming', slug: 'pet-grooming', parentId: 'pets-animals' },
  { name: 'Veterinary Services', slug: 'veterinary', parentId: 'pets-animals' },
  { name: 'Pet Accessories', slug: 'pet-accessories', parentId: 'pets-animals' },
];

const foodSubs = [
  { name: 'Fresh Groceries', slug: 'fresh-groceries', parentId: 'food-drinks' },
  { name: 'Beverages & Juices', slug: 'beverages-juices', parentId: 'food-drinks' },
  { name: 'Snacks & Sweets', slug: 'snacks-sweets', parentId: 'food-drinks' },
  { name: 'Cooking Oil & Fats', slug: 'cooking-oil', parentId: 'food-drinks' },
  { name: 'Cereals & Grains', slug: 'cereals-grains', parentId: 'food-drinks' },
  { name: 'Spices & Seasonings', slug: 'spices-seasonings', parentId: 'food-drinks' },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', parentId: 'food-drinks' },
  { name: 'Meat & Fish', slug: 'meat-fish', parentId: 'food-drinks' },
  { name: 'Catering Services', slug: 'catering', parentId: 'food-drinks' },
  { name: 'Bulk & Wholesale', slug: 'bulk-wholesale', parentId: 'food-drinks' },
  { name: 'Restaurant & Food Business', slug: 'restaurant-food-business', parentId: 'food-drinks' },
  { name: 'Traditional Kenyan Foods', slug: 'traditional-kenyan', parentId: 'food-drinks' },
];

const hobbiesSubs = [
  { name: 'Art & Painting Supplies', slug: 'art-supplies', parentId: 'hobbies-arts' },
  { name: 'Musical Instruments', slug: 'musical-instruments', parentId: 'hobbies-arts' },
  { name: 'Collectibles & Memorabilia', slug: 'collectibles', parentId: 'hobbies-arts' },
  { name: 'DIY Tools & Hardware', slug: 'diy-tools', parentId: 'hobbies-arts' },
  { name: 'Sewing & Knitting', slug: 'sewing-knitting', parentId: 'hobbies-arts' },
  { name: 'Crafts & Beading', slug: 'crafts-beading', parentId: 'hobbies-arts' },
  { name: 'Photography Equipment', slug: 'photography-equipment', parentId: 'hobbies-arts' },
  { name: 'Party & Event Supplies', slug: 'party-supplies', parentId: 'hobbies-arts' },
  { name: 'Models & Miniatures', slug: 'models-miniatures', parentId: 'hobbies-arts' },
  { name: 'Gardening Supplies', slug: 'gardening-supplies', parentId: 'hobbies-arts' },
];

const travelSubs = [
  { name: 'Hotels & Lodging', slug: 'hotels-lodging', parentId: 'travel-tourism' },
  { name: 'Guest Houses & B&Bs', slug: 'guest-houses', parentId: 'travel-tourism' },
  { name: 'Tour Packages & Safaris', slug: 'tour-packages', parentId: 'travel-tourism' },
  { name: 'Flights & Air Travel', slug: 'flights', parentId: 'travel-tourism' },
  { name: 'Bus & Matatu Travel', slug: 'bus-travel', parentId: 'travel-tourism' },
  { name: 'Car Rentals & Self Drive', slug: 'car-rentals', parentId: 'travel-tourism' },
  { name: 'Travel Accessories', slug: 'travel-accessories', parentId: 'travel-tourism' },
  { name: 'Vacation Rentals', slug: 'vacation-rentals', parentId: 'travel-tourism' },
  { name: 'Travel Insurance', slug: 'travel-insurance', parentId: 'travel-tourism' },
  { name: 'Airbnb Management', slug: 'airbnb-management', parentId: 'travel-tourism' },
];

interface LocationSeed {
  name: string
  slug: string
  level: number
  parentSlug?: string
  order: number
}

const locations: LocationSeed[] = [
  // ── Country ──
  { name: 'Kenya', slug: 'kenya', level: 0, order: 0 },

  // ── Counties (level 1) ──
  { name: 'Nairobi', slug: 'nairobi', level: 1, parentSlug: 'kenya', order: 1 },
  { name: 'Mombasa', slug: 'mombasa', level: 1, parentSlug: 'kenya', order: 2 },
  { name: 'Kisumu', slug: 'kisumu', level: 1, parentSlug: 'kenya', order: 3 },
  { name: 'Nakuru', slug: 'nakuru', level: 1, parentSlug: 'kenya', order: 4 },
  { name: 'Kiambu', slug: 'kiambu', level: 1, parentSlug: 'kenya', order: 5 },
  { name: 'Uasin Gishu', slug: 'uasin-gishu', level: 1, parentSlug: 'kenya', order: 6 },
  { name: 'Kilifi', slug: 'kilifi', level: 1, parentSlug: 'kenya', order: 7 },
  { name: 'Trans Nzoia', slug: 'trans-nzoia', level: 1, parentSlug: 'kenya', order: 8 },
  { name: 'Nyeri', slug: 'nyeri', level: 1, parentSlug: 'kenya', order: 9 },
  { name: 'Machakos', slug: 'machakos', level: 1, parentSlug: 'kenya', order: 10 },
  { name: 'Meru', slug: 'meru', level: 1, parentSlug: 'kenya', order: 11 },
  { name: 'Laikipia', slug: 'laikipia', level: 1, parentSlug: 'kenya', order: 12 },
  { name: 'Kakamega', slug: 'kakamega', level: 1, parentSlug: 'kenya', order: 13 },
  { name: 'Garissa', slug: 'garissa', level: 1, parentSlug: 'kenya', order: 14 },
  { name: 'Kericho', slug: 'kericho', level: 1, parentSlug: 'kenya', order: 15 },
  { name: 'Kajiado', slug: 'kajiado', level: 1, parentSlug: 'kenya', order: 16 },
  { name: 'Migori', slug: 'migori', level: 1, parentSlug: 'kenya', order: 17 },
  { name: 'Bungoma', slug: 'bungoma', level: 1, parentSlug: 'kenya', order: 18 },
  { name: 'Vihiga', slug: 'vihiga', level: 1, parentSlug: 'kenya', order: 19 },
  { name: 'Kwale', slug: 'kwale', level: 1, parentSlug: 'kenya', order: 20 },
  { name: 'Taita Taveta', slug: 'taita-taveta', level: 1, parentSlug: 'kenya', order: 21 },
  { name: 'Tana River', slug: 'tana-river', level: 1, parentSlug: 'kenya', order: 22 },
  { name: 'Lamu', slug: 'lamu', level: 1, parentSlug: 'kenya', order: 23 },
  { name: 'Marsabit', slug: 'marsabit', level: 1, parentSlug: 'kenya', order: 24 },
  { name: 'Mandera', slug: 'mandera', level: 1, parentSlug: 'kenya', order: 25 },
  { name: 'Wajir', slug: 'wajir', level: 1, parentSlug: 'kenya', order: 26 },
  { name: 'Isiolo', slug: 'isiolo', level: 1, parentSlug: 'kenya', order: 27 },
  { name: "Murang'a", slug: 'muranga', level: 1, parentSlug: 'kenya', order: 28 },
  { name: 'Kirinyaga', slug: 'kirinyaga', level: 1, parentSlug: 'kenya', order: 29 },
  { name: 'Embu', slug: 'embu', level: 1, parentSlug: 'kenya', order: 30 },
  { name: 'Turkana', slug: 'turkana', level: 1, parentSlug: 'kenya', order: 31 },
  { name: 'West Pokot', slug: 'west-pokot', level: 1, parentSlug: 'kenya', order: 32 },
  { name: 'Samburu', slug: 'samburu', level: 1, parentSlug: 'kenya', order: 33 },
  { name: 'Narok', slug: 'narok', level: 1, parentSlug: 'kenya', order: 34 },
  { name: 'Bomet', slug: 'bomet', level: 1, parentSlug: 'kenya', order: 35 },
  { name: 'Nyamira', slug: 'nyamira', level: 1, parentSlug: 'kenya', order: 36 },
  { name: 'Kisii', slug: 'kisii', level: 1, parentSlug: 'kenya', order: 37 },
  { name: 'Homa Bay', slug: 'homa-bay', level: 1, parentSlug: 'kenya', order: 38 },
  { name: 'Siaya', slug: 'siaya', level: 1, parentSlug: 'kenya', order: 39 },
  { name: 'Busia', slug: 'busia', level: 1, parentSlug: 'kenya', order: 40 },
  { name: 'Elgeyo Marakwet', slug: 'elgeyo-marakwet', level: 1, parentSlug: 'kenya', order: 41 },
  { name: 'Nandi', slug: 'nandi', level: 1, parentSlug: 'kenya', order: 42 },
  { name: 'Tharaka Nithi', slug: 'tharaka-nithi', level: 1, parentSlug: 'kenya', order: 43 },
  { name: 'Makueni', slug: 'makueni', level: 1, parentSlug: 'kenya', order: 44 },
  { name: 'Kitui', slug: 'kitui', level: 1, parentSlug: 'kenya', order: 45 },
  { name: 'Nyandarua', slug: 'nyandarua', level: 1, parentSlug: 'kenya', order: 46 },
  { name: 'Baringo', slug: 'baringo', level: 1, parentSlug: 'kenya', order: 47 },

  // ── Sub-Counties / Major Towns (level 2) ──

  // Nairobi
  { name: 'Westlands', slug: 'westlands', level: 2, parentSlug: 'nairobi', order: 1 },
  { name: 'Kilimani', slug: 'kilimani', level: 2, parentSlug: 'nairobi', order: 2 },
  { name: 'Karen', slug: 'karen', level: 2, parentSlug: 'nairobi', order: 3 },
  { name: 'Eastlands', slug: 'eastlands', level: 2, parentSlug: 'nairobi', order: 4 },
  { name: 'CBD', slug: 'nairobi-cbd', level: 2, parentSlug: 'nairobi', order: 5 },
  { name: 'Langata', slug: 'langata', level: 2, parentSlug: 'nairobi', order: 6 },
  { name: 'South B', slug: 'south-b', level: 2, parentSlug: 'nairobi', order: 7 },
  { name: 'South C', slug: 'south-c', level: 2, parentSlug: 'nairobi', order: 8 },
  { name: 'Kasarani', slug: 'kasarani', level: 2, parentSlug: 'nairobi', order: 9 },
  { name: 'Roysambu', slug: 'roysambu', level: 2, parentSlug: 'nairobi', order: 10 },
  { name: 'Ruaraka', slug: 'ruaraka', level: 2, parentSlug: 'nairobi', order: 11 },
  { name: 'Embakasi', slug: 'embakasi', level: 2, parentSlug: 'nairobi', order: 12 },
  { name: 'Dagoretti', slug: 'dagoretti', level: 2, parentSlug: 'nairobi', order: 13 },

  // Mombasa
  { name: 'Nyali', slug: 'nyali', level: 2, parentSlug: 'mombasa', order: 1 },
  { name: 'Likoni', slug: 'likoni', level: 2, parentSlug: 'mombasa', order: 2 },
  { name: 'Bamburi', slug: 'bamburi', level: 2, parentSlug: 'mombasa', order: 3 },
  { name: 'Mombasa Island', slug: 'mombasa-island', level: 2, parentSlug: 'mombasa', order: 4 },
  { name: 'Changamwe', slug: 'changamwe', level: 2, parentSlug: 'mombasa', order: 5 },
  { name: 'Kisauni', slug: 'kisauni', level: 2, parentSlug: 'mombasa', order: 6 },

  // Kisumu
  { name: 'Milimani', slug: 'milimani', level: 2, parentSlug: 'kisumu', order: 1 },
  { name: 'Kondele', slug: 'kondele', level: 2, parentSlug: 'kisumu', order: 2 },
  { name: 'Kisumu CBD', slug: 'kisumu-cbd', level: 2, parentSlug: 'kisumu', order: 3 },
  { name: 'Nyalenda', slug: 'nyalenda', level: 2, parentSlug: 'kisumu', order: 4 },
  { name: 'Manyatta', slug: 'manyatta', level: 2, parentSlug: 'kisumu', order: 5 },
  { name: 'Mamboleo', slug: 'mamboleo', level: 2, parentSlug: 'kisumu', order: 6 },

  // Nakuru
  { name: 'Nakuru Town', slug: 'nakuru-town', level: 2, parentSlug: 'nakuru', order: 1 },
  { name: 'Lanet', slug: 'lanet', level: 2, parentSlug: 'nakuru', order: 2 },
  { name: 'Naivasha', slug: 'naivasha', level: 2, parentSlug: 'nakuru', order: 3 },
  { name: 'Gilgil', slug: 'gilgil', level: 2, parentSlug: 'nakuru', order: 4 },
  { name: 'Molo', slug: 'molo', level: 2, parentSlug: 'nakuru', order: 5 },
  { name: 'Njoro', slug: 'njoro', level: 2, parentSlug: 'nakuru', order: 6 },
  { name: 'Elementaita', slug: 'elementaita', level: 2, parentSlug: 'nakuru', order: 7 },

  // Kiambu
  { name: 'Thika', slug: 'thika', level: 2, parentSlug: 'kiambu', order: 1 },
  { name: 'Ruiru', slug: 'ruiru', level: 2, parentSlug: 'kiambu', order: 2 },
  { name: 'Limuru', slug: 'limuru', level: 2, parentSlug: 'kiambu', order: 3 },
  { name: 'Kikuyu', slug: 'kikuyu', level: 2, parentSlug: 'kiambu', order: 4 },
  { name: 'Kiambu Town', slug: 'kiambu-town', level: 2, parentSlug: 'kiambu', order: 5 },
  { name: 'Juja', slug: 'juja', level: 2, parentSlug: 'kiambu', order: 6 },
  { name: 'Githunguri', slug: 'githunguri', level: 2, parentSlug: 'kiambu', order: 7 },
  { name: 'Kabete', slug: 'kabete', level: 2, parentSlug: 'kiambu', order: 8 },
  { name: 'Gatundu', slug: 'gatundu', level: 2, parentSlug: 'kiambu', order: 9 },

  // Uasin Gishu
  { name: 'Eldoret', slug: 'eldoret', level: 2, parentSlug: 'uasin-gishu', order: 1 },
  { name: 'Moiben', slug: 'moiben', level: 2, parentSlug: 'uasin-gishu', order: 2 },
  { name: 'Soy', slug: 'soy', level: 2, parentSlug: 'uasin-gishu', order: 3 },
  { name: 'Turbo', slug: 'turbo', level: 2, parentSlug: 'uasin-gishu', order: 4 },
  { name: 'Kapseret', slug: 'kapseret', level: 2, parentSlug: 'uasin-gishu', order: 5 },
  { name: 'Pioneer', slug: 'pioneer-eldoret', level: 2, parentSlug: 'uasin-gishu', order: 6 },

  // Kilifi
  { name: 'Malindi', slug: 'malindi', level: 2, parentSlug: 'kilifi', order: 1 },
  { name: 'Kilifi Town', slug: 'kilifi-town', level: 2, parentSlug: 'kilifi', order: 2 },
  { name: 'Watamu', slug: 'watamu', level: 2, parentSlug: 'kilifi', order: 3 },
  { name: 'Mtwapa', slug: 'mtwapa', level: 2, parentSlug: 'kilifi', order: 4 },
  { name: 'Mariakani', slug: 'mariakani', level: 2, parentSlug: 'kilifi', order: 5 },
  { name: 'Kaloleni', slug: 'kaloleni', level: 2, parentSlug: 'kilifi', order: 6 },

  // Trans Nzoia
  { name: 'Kitale', slug: 'kitale', level: 2, parentSlug: 'trans-nzoia', order: 1 },
  { name: 'Kiminini', slug: 'kiminini', level: 2, parentSlug: 'trans-nzoia', order: 2 },
  { name: 'Kwanza', slug: 'kwanza', level: 2, parentSlug: 'trans-nzoia', order: 3 },
  { name: 'Saboti', slug: 'saboti', level: 2, parentSlug: 'trans-nzoia', order: 4 },

  // Nyeri
  { name: 'Karatina', slug: 'karatina', level: 2, parentSlug: 'nyeri', order: 1 },
  { name: 'Othaya', slug: 'othaya', level: 2, parentSlug: 'nyeri', order: 2 },
  { name: 'Mukurwe-ini', slug: 'mukurwe-ini', level: 2, parentSlug: 'nyeri', order: 3 },
  { name: 'Tetu', slug: 'tetu', level: 2, parentSlug: 'nyeri', order: 4 },
  { name: 'Mathira', slug: 'mathira', level: 2, parentSlug: 'nyeri', order: 5 },

  // Machakos
  { name: 'Athi River', slug: 'athi-river', level: 2, parentSlug: 'machakos', order: 1 },
  { name: 'Kangundo', slug: 'kangundo', level: 2, parentSlug: 'machakos', order: 2 },
  { name: 'Mavoko', slug: 'mavoko', level: 2, parentSlug: 'machakos', order: 3 },
  { name: 'Machakos Town', slug: 'machakos-town', level: 2, parentSlug: 'machakos', order: 4 },
  { name: 'Masaku', slug: 'masaku', level: 2, parentSlug: 'machakos', order: 5 },
  { name: 'Kathiani', slug: 'kathiani', level: 2, parentSlug: 'machakos', order: 6 },

  // Meru
  { name: 'Timau', slug: 'timau', level: 2, parentSlug: 'meru', order: 1 },
  { name: 'Maua', slug: 'maua', level: 2, parentSlug: 'meru', order: 2 },
  { name: 'Nkubu', slug: 'nkubu', level: 2, parentSlug: 'meru', order: 3 },
  { name: 'Meru Town', slug: 'meru-town', level: 2, parentSlug: 'meru', order: 4 },
  { name: 'Gatunga', slug: 'gatunga', level: 2, parentSlug: 'meru', order: 5 },

  // Laikipia
  { name: 'Nanyuki', slug: 'nanyuki', level: 2, parentSlug: 'laikipia', order: 1 },
  { name: 'Rumuruti', slug: 'rumuruti', level: 2, parentSlug: 'laikipia', order: 2 },
  { name: 'Laikipia North', slug: 'laikipia-north', level: 2, parentSlug: 'laikipia', order: 3 },

  // Kakamega
  { name: 'Mumias', slug: 'mumias', level: 2, parentSlug: 'kakamega', order: 1 },
  { name: 'Butere', slug: 'butere', level: 2, parentSlug: 'kakamega', order: 2 },
  { name: 'Kakamega Town', slug: 'kakamega-town', level: 2, parentSlug: 'kakamega', order: 3 },
  { name: 'Malava', slug: 'malava', level: 2, parentSlug: 'kakamega', order: 4 },
  { name: 'Lugari', slug: 'lugari', level: 2, parentSlug: 'kakamega', order: 5 },
  { name: 'Navakholo', slug: 'navakholo', level: 2, parentSlug: 'kakamega', order: 6 },

  // Garissa
  { name: 'Garissa Town', slug: 'garissa-town', level: 2, parentSlug: 'garissa', order: 1 },
  { name: 'Dadaab', slug: 'dadaab', level: 2, parentSlug: 'garissa', order: 2 },
  { name: 'Hola', slug: 'hola', level: 2, parentSlug: 'garissa', order: 3 },
  { name: 'Ijara', slug: 'ijara', level: 2, parentSlug: 'garissa', order: 4 },

  // Kericho
  { name: 'Londiani', slug: 'londiani', level: 2, parentSlug: 'kericho', order: 1 },
  { name: 'Kipkelion', slug: 'kipkelion', level: 2, parentSlug: 'kericho', order: 2 },
  { name: 'Kericho Town', slug: 'kericho-town', level: 2, parentSlug: 'kericho', order: 3 },
  { name: 'Sotik', slug: 'sotik', level: 2, parentSlug: 'kericho', order: 4 },
  { name: 'Buret', slug: 'buret', level: 2, parentSlug: 'kericho', order: 5 },

  // Kajiado
  { name: 'Ngong', slug: 'ngong', level: 2, parentSlug: 'kajiado', order: 1 },
  { name: 'Kitengela', slug: 'kitengela', level: 2, parentSlug: 'kajiado', order: 2 },
  { name: 'Isinya', slug: 'isinya', level: 2, parentSlug: 'kajiado', order: 3 },
  { name: 'Kiserian', slug: 'kiserian', level: 2, parentSlug: 'kajiado', order: 4 },
  { name: 'Ongata Rongai', slug: 'ongata-rongai', level: 2, parentSlug: 'kajiado', order: 5 },
  { name: 'Mashuuru', slug: 'mashuuru', level: 2, parentSlug: 'kajiado', order: 6 },
  { name: 'Loitoktok', slug: 'loitoktok', level: 2, parentSlug: 'kajiado', order: 7 },

  // Migori
  { name: 'Awendo', slug: 'awendo', level: 2, parentSlug: 'migori', order: 1 },
  { name: 'Kehancha', slug: 'kehancha', level: 2, parentSlug: 'migori', order: 2 },
  { name: 'Migori Town', slug: 'migori-town', level: 2, parentSlug: 'migori', order: 3 },
  { name: 'Rongo', slug: 'rongo', level: 2, parentSlug: 'migori', order: 4 },
  { name: 'Uriri', slug: 'uriri', level: 2, parentSlug: 'migori', order: 5 },

  // Bungoma
  { name: 'Webuye', slug: 'webuye', level: 2, parentSlug: 'bungoma', order: 1 },
  { name: 'Kimilili', slug: 'kimilili', level: 2, parentSlug: 'bungoma', order: 2 },
  { name: 'Bungoma Town', slug: 'bungoma-town', level: 2, parentSlug: 'bungoma', order: 3 },
  { name: 'Sirisia', slug: 'sirisia', level: 2, parentSlug: 'bungoma', order: 4 },
  { name: 'Chwele', slug: 'chwele', level: 2, parentSlug: 'bungoma', order: 5 },
  { name: 'Mt Elgon', slug: 'mt-elgon', level: 2, parentSlug: 'bungoma', order: 6 },

  // Vihiga
  { name: 'Mbale', slug: 'mbale', level: 2, parentSlug: 'vihiga', order: 1 },
  { name: 'Luanda', slug: 'luanda', level: 2, parentSlug: 'vihiga', order: 2 },
  { name: 'Vihiga Town', slug: 'vihiga-town', level: 2, parentSlug: 'vihiga', order: 3 },
  { name: 'Emuhaya', slug: 'emuhaya', level: 2, parentSlug: 'vihiga', order: 4 },
  { name: 'Sabatia', slug: 'sabatia', level: 2, parentSlug: 'vihiga', order: 5 },

  // Kwale
  { name: 'Diani', slug: 'diani', level: 2, parentSlug: 'kwale', order: 1 },
  { name: 'Ukunda', slug: 'ukunda', level: 2, parentSlug: 'kwale', order: 2 },
  { name: 'Msambweni', slug: 'msambweni', level: 2, parentSlug: 'kwale', order: 3 },
  { name: 'Kwale Town', slug: 'kwale-town', level: 2, parentSlug: 'kwale', order: 4 },
  { name: 'Kinango', slug: 'kinango', level: 2, parentSlug: 'kwale', order: 5 },
  { name: 'Lunga Lunga', slug: 'lunga-lunga', level: 2, parentSlug: 'kwale', order: 6 },

  // Taita Taveta
  { name: 'Voi', slug: 'voi', level: 2, parentSlug: 'taita-taveta', order: 1 },
  { name: 'Taveta', slug: 'taveta', level: 2, parentSlug: 'taita-taveta', order: 2 },
  { name: 'Wundanyi', slug: 'wundanyi', level: 2, parentSlug: 'taita-taveta', order: 3 },
  { name: 'Mwatate', slug: 'mwatate', level: 2, parentSlug: 'taita-taveta', order: 4 },

  // Tana River
  { name: 'Hola Town', slug: 'hola-town', level: 2, parentSlug: 'tana-river', order: 1 },
  { name: 'Garsen', slug: 'garsen', level: 2, parentSlug: 'tana-river', order: 2 },
  { name: 'Madogo', slug: 'madogo', level: 2, parentSlug: 'tana-river', order: 3 },

  // Lamu
  { name: 'Lamu Old Town', slug: 'lamu-old-town', level: 2, parentSlug: 'lamu', order: 1 },
  { name: 'Mpeketoni', slug: 'mpeketoni', level: 2, parentSlug: 'lamu', order: 2 },
  { name: 'Sheila', slug: 'sheila', level: 2, parentSlug: 'lamu', order: 3 },
  { name: 'Faza', slug: 'faza', level: 2, parentSlug: 'lamu', order: 4 },
  { name: 'Kizingo', slug: 'kizingo', level: 2, parentSlug: 'lamu', order: 5 },

  // Marsabit
  { name: 'Marsabit Town', slug: 'marsabit-town', level: 2, parentSlug: 'marsabit', order: 1 },
  { name: 'Moyale', slug: 'moyale', level: 2, parentSlug: 'marsabit', order: 2 },
  { name: 'Laisamis', slug: 'laisamis', level: 2, parentSlug: 'marsabit', order: 3 },
  { name: 'North Horr', slug: 'north-horr', level: 2, parentSlug: 'marsabit', order: 4 },

  // Mandera
  { name: 'Mandera Town', slug: 'mandera-town', level: 2, parentSlug: 'mandera', order: 1 },
  { name: 'El Wak', slug: 'el-wak', level: 2, parentSlug: 'mandera', order: 2 },
  { name: 'Rhamu', slug: 'rhamu', level: 2, parentSlug: 'mandera', order: 3 },
  { name: 'Takaba', slug: 'takaba', level: 2, parentSlug: 'mandera', order: 4 },
  { name: 'Lafey', slug: 'lafey', level: 2, parentSlug: 'mandera', order: 5 },

  // Wajir
  { name: 'Wajir Town', slug: 'wajir-town', level: 2, parentSlug: 'wajir', order: 1 },
  { name: 'Habaswein', slug: 'habaswein', level: 2, parentSlug: 'wajir', order: 2 },
  { name: 'Tarbaj', slug: 'tarbaj', level: 2, parentSlug: 'wajir', order: 3 },
  { name: 'Eldas', slug: 'eldas', level: 2, parentSlug: 'wajir', order: 4 },
  { name: 'Buna', slug: 'buna', level: 2, parentSlug: 'wajir', order: 5 },

  // Isiolo
  { name: 'Isiolo Town', slug: 'isiolo-town', level: 2, parentSlug: 'isiolo', order: 1 },
  { name: 'Merti', slug: 'merti', level: 2, parentSlug: 'isiolo', order: 2 },
  { name: 'Garba Tula', slug: 'garba-tula', level: 2, parentSlug: 'isiolo', order: 3 },
  { name: 'Kina', slug: 'kina', level: 2, parentSlug: 'isiolo', order: 4 },

  // Murang'a
  { name: 'Muranga Town', slug: 'muranga-town', level: 2, parentSlug: 'muranga', order: 1 },
  { name: 'Sagana', slug: 'sagana', level: 2, parentSlug: 'muranga', order: 2 },
  { name: 'Kangema', slug: 'kangema', level: 2, parentSlug: 'muranga', order: 3 },
  { name: 'Kigumo', slug: 'kigumo', level: 2, parentSlug: 'muranga', order: 4 },
  { name: 'Kahuro', slug: 'kahuro', level: 2, parentSlug: 'muranga', order: 5 },
  { name: 'Mathioya', slug: 'mathioya', level: 2, parentSlug: 'muranga', order: 6 },

  // Kirinyaga
  { name: 'Kerugoya', slug: 'kerugoya', level: 2, parentSlug: 'kirinyaga', order: 1 },
  { name: 'Sagana Kirinyaga', slug: 'sagana-kirinyaga', level: 2, parentSlug: 'kirinyaga', order: 2 },
  { name: 'Wanguru', slug: 'wanguru', level: 2, parentSlug: 'kirinyaga', order: 3 },
  { name: 'Kianyaga', slug: 'kianyaga', level: 2, parentSlug: 'kirinyaga', order: 4 },
  { name: 'Ndia', slug: 'ndia', level: 2, parentSlug: 'kirinyaga', order: 5 },

  // Embu
  { name: 'Embu Town', slug: 'embu-town', level: 2, parentSlug: 'embu', order: 1 },
  { name: 'Runyenjes', slug: 'runyenjes', level: 2, parentSlug: 'embu', order: 2 },
  { name: 'Manyatta Embu', slug: 'manyatta-embu', level: 2, parentSlug: 'embu', order: 3 },
  { name: 'Kyeni', slug: 'kyeni', level: 2, parentSlug: 'embu', order: 4 },

  // Turkana
  { name: 'Lodwar', slug: 'lodwar', level: 2, parentSlug: 'turkana', order: 1 },
  { name: 'Lokichogio', slug: 'lokichogio', level: 2, parentSlug: 'turkana', order: 2 },
  { name: 'Lokitaung', slug: 'lokitaung', level: 2, parentSlug: 'turkana', order: 3 },
  { name: 'Kakuma', slug: 'kakuma', level: 2, parentSlug: 'turkana', order: 4 },
  { name: 'Turkwell', slug: 'turkwell', level: 2, parentSlug: 'turkana', order: 5 },

  // West Pokot
  { name: 'Kapenguria', slug: 'kapenguria', level: 2, parentSlug: 'west-pokot', order: 1 },
  { name: 'Ortum', slug: 'ortum', level: 2, parentSlug: 'west-pokot', order: 2 },
  { name: 'Kacheliba', slug: 'kacheliba', level: 2, parentSlug: 'west-pokot', order: 3 },
  { name: 'Pokot South', slug: 'pokot-south', level: 2, parentSlug: 'west-pokot', order: 4 },

  // Samburu
  { name: 'Maralal', slug: 'maralal', level: 2, parentSlug: 'samburu', order: 1 },
  { name: 'Archers Post', slug: 'archers-post', level: 2, parentSlug: 'samburu', order: 2 },
  { name: 'Baragoi', slug: 'baragoi', level: 2, parentSlug: 'samburu', order: 3 },
  { name: 'Wamba', slug: 'wamba', level: 2, parentSlug: 'samburu', order: 4 },

  // Narok
  { name: 'Narok Town', slug: 'narok-town', level: 2, parentSlug: 'narok', order: 1 },
  { name: 'Mai Mahiu', slug: 'mai-mahiu', level: 2, parentSlug: 'narok', order: 2 },
  { name: 'Mara', slug: 'mara', level: 2, parentSlug: 'narok', order: 3 },
  { name: 'Kilgoris', slug: 'kilgoris', level: 2, parentSlug: 'narok', order: 4 },
  { name: 'Suswa', slug: 'suswa', level: 2, parentSlug: 'narok', order: 5 },
  { name: 'Ololulunga', slug: 'ololulunga', level: 2, parentSlug: 'narok', order: 6 },

  // Bomet
  { name: 'Bomet Town', slug: 'bomet-town', level: 2, parentSlug: 'bomet', order: 1 },
  { name: 'Sotik Bomet', slug: 'sotik-bomet', level: 2, parentSlug: 'bomet', order: 2 },
  { name: 'Ndanai', slug: 'ndanai', level: 2, parentSlug: 'bomet', order: 3 },
  { name: 'Chepalungu', slug: 'chepalungu', level: 2, parentSlug: 'bomet', order: 4 },
  { name: 'Tenwek', slug: 'tenwek', level: 2, parentSlug: 'bomet', order: 5 },

  // Nyamira
  { name: 'Nyamira Town', slug: 'nyamira-town', level: 2, parentSlug: 'nyamira', order: 1 },
  { name: 'Keroka', slug: 'keroka', level: 2, parentSlug: 'nyamira', order: 2 },
  { name: 'Nyansiongo', slug: 'nyansiongo', level: 2, parentSlug: 'nyamira', order: 3 },
  { name: 'Borabu', slug: 'borabu', level: 2, parentSlug: 'nyamira', order: 4 },
  { name: 'Manga', slug: 'manga', level: 2, parentSlug: 'nyamira', order: 5 },

  // Kisii
  { name: 'Kisii Town', slug: 'kisii-town', level: 2, parentSlug: 'kisii', order: 1 },
  { name: 'Ogembo', slug: 'ogembo', level: 2, parentSlug: 'kisii', order: 2 },
  { name: 'Suneka', slug: 'suneka', level: 2, parentSlug: 'kisii', order: 3 },
  { name: 'Mogonga', slug: 'mogonga', level: 2, parentSlug: 'kisii', order: 4 },
  { name: 'Tabaka', slug: 'tabaka', level: 2, parentSlug: 'kisii', order: 5 },
  { name: 'Nduru', slug: 'nduru', level: 2, parentSlug: 'kisii', order: 6 },
  { name: 'Marani', slug: 'marani', level: 2, parentSlug: 'kisii', order: 7 },

  // Homa Bay
  { name: 'Homa Bay Town', slug: 'homa-bay-town', level: 2, parentSlug: 'homa-bay', order: 1 },
  { name: 'Mbita', slug: 'mbita', level: 2, parentSlug: 'homa-bay', order: 2 },
  { name: 'Oyugis', slug: 'oyugis', level: 2, parentSlug: 'homa-bay', order: 3 },
  { name: 'Kendu Bay', slug: 'kendu-bay', level: 2, parentSlug: 'homa-bay', order: 4 },
  { name: 'Rachuonyo', slug: 'rachuonyo', level: 2, parentSlug: 'homa-bay', order: 5 },

  // Siaya
  { name: 'Siaya Town', slug: 'siaya-town', level: 2, parentSlug: 'siaya', order: 1 },
  { name: 'Bondo', slug: 'bondo', level: 2, parentSlug: 'siaya', order: 2 },
  { name: 'Ugunja', slug: 'ugunja', level: 2, parentSlug: 'siaya', order: 3 },
  { name: 'Ukwala', slug: 'ukwala', level: 2, parentSlug: 'siaya', order: 4 },
  { name: 'Yala', slug: 'yala', level: 2, parentSlug: 'siaya', order: 5 },

  // Busia
  { name: 'Busia Town', slug: 'busia-town', level: 2, parentSlug: 'busia', order: 1 },
  { name: 'Nambale', slug: 'nambale', level: 2, parentSlug: 'busia', order: 2 },
  { name: 'Teso', slug: 'teso', level: 2, parentSlug: 'busia', order: 3 },
  { name: 'Samia', slug: 'samia', level: 2, parentSlug: 'busia', order: 4 },
  { name: 'Butula', slug: 'butula', level: 2, parentSlug: 'busia', order: 5 },
  { name: 'Port Victoria', slug: 'port-victoria', level: 2, parentSlug: 'busia', order: 6 },

  // Elgeyo Marakwet
  { name: 'Iten', slug: 'iten', level: 2, parentSlug: 'elgeyo-marakwet', order: 1 },
  { name: 'Kapsowar', slug: 'kapsowar', level: 2, parentSlug: 'elgeyo-marakwet', order: 2 },
  { name: 'Chesoi', slug: 'chesoi', level: 2, parentSlug: 'elgeyo-marakwet', order: 3 },
  { name: 'Keiyo', slug: 'keiyo', level: 2, parentSlug: 'elgeyo-marakwet', order: 4 },
  { name: 'Marakwet', slug: 'marakwet', level: 2, parentSlug: 'elgeyo-marakwet', order: 5 },
  { name: 'Tambach', slug: 'tambach', level: 2, parentSlug: 'elgeyo-marakwet', order: 6 },

  // Nandi
  { name: 'Kapsabet', slug: 'kapsabet', level: 2, parentSlug: 'nandi', order: 1 },
  { name: 'Nandi Hills', slug: 'nandi-hills', level: 2, parentSlug: 'nandi', order: 2 },
  { name: 'Tinderet', slug: 'tinderet', level: 2, parentSlug: 'nandi', order: 3 },
  { name: 'Chesumei', slug: 'chesumei', level: 2, parentSlug: 'nandi', order: 4 },
  { name: 'Kobujoi', slug: 'kobujoi', level: 2, parentSlug: 'nandi', order: 5 },
  { name: 'Mosoriot', slug: 'mosoriot', level: 2, parentSlug: 'nandi', order: 6 },

  // Tharaka Nithi
  { name: 'Chuka', slug: 'chuka', level: 2, parentSlug: 'tharaka-nithi', order: 1 },
  { name: 'Chogoria', slug: 'chogoria', level: 2, parentSlug: 'tharaka-nithi', order: 2 },
  { name: 'Marima', slug: 'marima', level: 2, parentSlug: 'tharaka-nithi', order: 3 },
  { name: 'Tharaka', slug: 'tharaka', level: 2, parentSlug: 'tharaka-nithi', order: 4 },

  // Makueni
  { name: 'Wote', slug: 'wote', level: 2, parentSlug: 'makueni', order: 1 },
  { name: 'Kibwezi', slug: 'kibwezi', level: 2, parentSlug: 'makueni', order: 2 },
  { name: 'Makindu', slug: 'makindu', level: 2, parentSlug: 'makueni', order: 3 },
  { name: 'Emali', slug: 'emali', level: 2, parentSlug: 'makueni', order: 4 },
  { name: 'Salama', slug: 'salama', level: 2, parentSlug: 'makueni', order: 5 },
  { name: 'Mtito Andei', slug: 'mtito-andei', level: 2, parentSlug: 'makueni', order: 6 },

  // Kitui
  { name: 'Kitui Town', slug: 'kitui-town', level: 2, parentSlug: 'kitui', order: 1 },
  { name: 'Mwingi', slug: 'mwingi', level: 2, parentSlug: 'kitui', order: 2 },
  { name: 'Mutomo', slug: 'mutomo', level: 2, parentSlug: 'kitui', order: 3 },
  { name: 'Kyuso', slug: 'kyuso', level: 2, parentSlug: 'kitui', order: 4 },
  { name: 'Ikutha', slug: 'ikutha', level: 2, parentSlug: 'kitui', order: 5 },
  { name: 'Kisasi', slug: 'kisasi', level: 2, parentSlug: 'kitui', order: 6 },

  // Nyandarua
  { name: 'Ol Kalou', slug: 'ol-kalou', level: 2, parentSlug: 'nyandarua', order: 1 },
  { name: 'Ol Jororok', slug: 'ol-jororok', level: 2, parentSlug: 'nyandarua', order: 2 },
  { name: 'Nyahururu', slug: 'nyahururu', level: 2, parentSlug: 'nyandarua', order: 3 },
  { name: 'Engineer', slug: 'engineer', level: 2, parentSlug: 'nyandarua', order: 4 },
  { name: 'Kinangop', slug: 'kinangop', level: 2, parentSlug: 'nyandarua', order: 5 },

  // Baringo
  { name: 'Kabarnet', slug: 'kabarnet', level: 2, parentSlug: 'baringo', order: 1 },
  { name: 'Eldama Ravine', slug: 'eldama-ravine', level: 2, parentSlug: 'baringo', order: 2 },
  { name: 'Mogotio', slug: 'mogotio', level: 2, parentSlug: 'baringo', order: 3 },
  { name: 'Marigat', slug: 'marigat', level: 2, parentSlug: 'baringo', order: 4 },
  { name: 'Baringo North', slug: 'baringo-north', level: 2, parentSlug: 'baringo', order: 5 },
  { name: 'Tiaty', slug: 'tiaty', level: 2, parentSlug: 'baringo', order: 6 },
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
    categorySlug: 'houses-rent',
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
    categorySlug: 'office-furniture',
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
    categorySlug: 'graphic-design',
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
    categorySlug: 'plumbing',
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
    categorySlug: 'livestock',
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
    categorySlug: 'mens-clothing',
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
    categorySlug: 'exercise-equipment',
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
    categorySlug: 'skincare',
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
    categorySlug: 'houses-sale',
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
    categorySlug: 'desktop-computers',
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
    categorySlug: 'accounting-tax',
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
    categorySlug: 'photography',
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
    { name: 'Free', slug: 'free', description: 'Get started with basic features', price: 0, currency: 'KES', interval: 'monthly', maxListings: 5, maxImages: 5, maxVideos: 0, isFeatured: false, isPromoted: false, isActive: true, order: 1, planFeatures: { create: [{ feature: '5 listings' }, { feature: '5 images per listing' }] } },
    { name: 'Premium', slug: 'premium', description: 'For serious sellers who want more exposure', price: 999, currency: 'KES', interval: 'monthly', maxListings: 50, maxImages: 10, maxVideos: 3, isFeatured: true, isPromoted: true, isActive: true, order: 2, planFeatures: { create: [{ feature: '50 listings' }, { feature: '10 images per listing' }, { feature: 'Featured' }, { feature: 'Boost' }] } },
    { name: 'Business', slug: 'business', description: 'Unlimited power for businesses', price: 4999, currency: 'KES', interval: 'monthly', maxListings: -1, maxImages: 20, maxVideos: 10, isFeatured: true, isPromoted: true, isActive: true, order: 3, planFeatures: { create: [{ feature: 'Unlimited listings' }, { feature: '20 images per listing' }, { feature: 'Featured' }, { feature: 'Boost' }, { feature: 'Storefront' }] } },
  ];
  for (const plan of plans) {
    const { planFeatures, ...planData } = plan;
    await db.plan.upsert({
      where: { slug: plan.slug },
      update: { ...planData, planFeatures: { deleteMany: {}, create: planFeatures.create } },
      create: { ...planData, planFeatures },
    });
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

  // Upsert locations (sorted by level so parents are created before children)
  const locationMap: Record<string, string> = {};
  const sortedLocations = [...locations].sort((a, b) => a.level - b.level);
  const levelLabels = ['Country', 'County', 'Sub-County', 'Area'];
  for (const loc of sortedLocations) {
    const { parentSlug, ...rest } = loc;
    const parentId = parentSlug && locationMap[parentSlug] ? locationMap[parentSlug] : null;
    const data = { ...rest, parentId };
    const created = await db.location.upsert({
      where: { slug: loc.slug },
      update: data,
      create: data,
    });
    locationMap[loc.slug] = created.id;
    console.log(`  Upserted location: ${loc.name} (${levelLabels[loc.level] || `Level ${loc.level}`})`);
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

  // Create 10 blog posts
  const blogPosts = [
    {
      title: 'How to Buy a Used Car in Kenya – A Complete Guide',
      slug: 'how-to-buy-a-used-car-in-kenya',
      content: `# How to Buy a Used Car in Kenya – A Complete Guide\n\nBuying a used car in Kenya can be both exciting and overwhelming. With thousands of listings on ChapKE, knowing what to look for will save you time and money.\n\n## Set Your Budget\n\nBefore you start browsing, determine your budget. Remember to factor in:\n- Insurance costs\n- Transfer fees at NTSA\n- Road worthiness inspection\n- Minor repairs and servicing\n\n## Research the Market\n\nBrowse ChapKE's vehicle section to compare prices across different makes and models. Popular choices in Kenya include:\n- Toyota (Vitz, Passo, Fielder)\n- Nissan (Note, Wingroad)\n- Subaru (Impreza, Forester)\n- Mazda (Demio, Axela)\n\n## Inspect the Car\n\nAlways inspect the car in person. Key things to check:\n- Engine condition and oil quality\n- Chassis number (matches logbook)\n- Tyre tread depth\n- Air conditioning functionality\n- Suspension and brakes\n\n## Verify Documents\n\nAsk for the original logbook and verify:  \n1. The chassis number matches the logbook  \n2. No outstanding loans on the vehicle  \n3. NTSA records are clean\n\n## Take a Test Drive\n\nA test drive reveals a lot about the car's condition. Listen for unusual engine noises, check gearbox smoothness, and test the brakes at different speeds.\n\n## Negotiate the Price\n\nUse your inspection findings to negotiate a fair price. Most sellers on ChapKE are open to negotiation, especially if you can pay in cash.\n\nWith these tips, you are ready to find your perfect car on ChapKE!`,
      excerpt: 'A step-by-step guide to buying a used car in Kenya, from setting a budget to test driving and negotiating the best price.',
      coverImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
      authorName: 'James Mwangi', category: 'Vehicles', status: 'published',
      tags: JSON.stringify(['cars', 'buying-guide', 'vehicles', 'kenya']),
      seoTitle: 'How to Buy a Used Car in Kenya – Complete Guide 2026 | ChapKE',
      seoDesc: 'Learn how to buy a used car in Kenya with our complete guide. Tips on budget, inspection, documents, test drives, and negotiation for the best deal.',
    },
    {
      title: 'Top 10 Tips for Selling Your Items Fast on ChapKE',
      slug: 'tips-for-selling-fast-on-chapke',
      content: `# Top 10 Tips for Selling Your Items Fast on ChapKE\n\nWant to sell your items quickly? Follow these proven tips to get your listings sold fast on ChapKE.\n\n## 1. Take Great Photos\n\nClear, well-lit photos from multiple angles get 3x more views. Use natural light and show the item from all sides.\n\n## 2. Write a Detailed Title\n\nInclude key details: brand, model, condition, and size. Example: "Samsung Galaxy S23 Ultra 256GB – Excellent Condition"\n\n## 3. Price It Right\n\nResearch similar listings on ChapKE to set a competitive price. Consider pricing 5-10% higher than your minimum to leave room for negotiation.\n\n## 4. Write a Complete Description\n\nAnswer every question a buyer might have. Include measurements, age, original price, and reason for selling.\n\n## 5. Use the Right Category\n\nList in the most specific category to reach the right buyers. A phone should go in "Phones & Tablets", not just "Electronics".\n\n## 6. Respond Quickly\n\nBuyers expect fast responses. Enable notifications and reply to inquiries within minutes to keep them engaged.\n\n## 7. Highlight Key Features\n\nUse bullet points to make important features easy to scan. Buyers decide in seconds whether to click.\n\n## 8. Offer Multiple Payment Options\n\nAccepting M-Pesa, bank transfer, and cash on delivery increases your pool of potential buyers.\n\n## 9. Share Your Listing\n\nShare your ChapKE listing on WhatsApp groups, Facebook, and Instagram for extra exposure.\n\n## 10. Keep Your Listing Updated\n\nIf an item doesn't sell, revise the price or refresh the photos. Sometimes a small change makes all the difference.`,
      excerpt: 'Learn the top 10 proven strategies to sell your items faster on ChapKE, from taking great photos to pricing and promotion tips.',
      coverImage: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?w=800&q=80',
      authorName: 'ChapKE Team', category: 'Selling Tips', status: 'published',
      tags: JSON.stringify(['selling', 'tips', 'marketplace', 'kenya']),
      seoTitle: 'Top 10 Tips for Selling Items Fast on ChapKE Kenya | ChapKE Blog',
      seoDesc: 'Sell your items faster on ChapKE with these 10 expert tips. From photography to pricing, learn how to attract buyers and close deals quickly.',
    },
    {
      title: 'The Ultimate Guide to Renting an Apartment in Nairobi',
      slug: 'guide-to-renting-in-nairobi',
      content: `# The Ultimate Guide to Renting an Apartment in Nairobi\n\nFinding the right apartment in Nairobi can be challenging. This guide will walk you through everything you need to know.\n\n## Determine Your Budget\n\nA general rule is to spend no more than 30% of your monthly income on rent. In Nairobi:\n- Budget options (KSh 10,000-25,000/month)\n- Mid-range (KSh 25,000-60,000/month)\n- High-end (KSh 60,000+/month)\n\n## Choose the Right Neighborhood\n\nPopular residential areas include:\n- **Westlands** – Upscale, close to business district\n- **Kilimani** – Trendy, good for young professionals\n- **South B/C** – Quiet, family-friendly\n- **Eastlands** – Affordable, established community\n- **Ruiru / Thika** – Budget-friendly, growing rapidly\n\n## What to Look for During Viewing\n\n- Water pressure and drainage\n- Electrical condition\n- Security (gates, guards, lighting)\n- Parking availability\n- Proximity to matatu stops\n\n## Understand the Lease Agreement\n\nRead carefully before signing. Key clauses to check:\n- Deposit requirement (usually 2 months)\n- Notice period for moving out\n- Maintenance responsibilities\n- Rent increment terms\n\n## Questions to Ask the Landlord\n\nBefore committing, ask:\n1. Is water included in the rent?\n2. Are pets allowed?\n3. What is the policy on visitors?\n4. Who handles repairs?\n\nBrowse ChapKE's property section to find apartments for rent in your preferred neighborhood!`,
      excerpt: 'Everything you need to know about renting an apartment in Nairobi, from budgeting and neighborhoods to lease agreements and viewing tips.',
      coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      authorName: 'Grace Wanjiku', category: 'Property', status: 'published',
      tags: JSON.stringify(['renting', 'nairobi', 'property', 'apartment']),
      seoTitle: 'Ultimate Guide to Renting an Apartment in Nairobi 2026 | ChapKE',
      seoDesc: 'Your complete guide to renting an apartment in Nairobi. Learn about budgets, neighborhoods, lease agreements, and what to check during property viewings.',
    },
    {
      title: 'How to Spot Online Scams When Buying and Selling',
      slug: 'how-to-spot-online-scams',
      content: `# How to Spot Online Scams When Buying and Selling\n\nOnline marketplaces are convenient, but scammers are everywhere. Here is how to protect yourself on ChapKE and beyond.\n\n## Common Scam Signs\n\n- **Too good to be true** – A brand new iPhone for KSh 10,000? Walk away.\n- **Pressure tactics** – "Pay now or someone else will take it" is a red flag.\n- **No phone calls** – A seller who refuses to speak on the phone is suspicious.\n- **Fake payment confirmations** – Always verify M-Pesa or bank payments in your account.\n\n## For Buyers\n\n1. Insist on meeting in person for high-value items\n2. Inspect the item before making any payment\n3. Use public meeting places like shopping malls\n4. Never share your M-Pesa PIN or bank details\n\n## For Sellers\n\n1. Do not release items until payment is confirmed in your account\n2. Beware of overpayment scams (buyer sends extra and asks for refund)\n3. Verify the buyer's identity if possible\n4. Keep records of all transactions\n\n## Safe Trading on ChapKE\n\nChapKE has safety features to protect you:\n- Verified seller badges\n- Report listing button\n- Secure messaging system\n- Seller ratings and reviews\n\n## What to Do If Scammed\n\nIf you suspect a scam:\n1. Report the listing on ChapKE immediately\n2. Contact your bank or M-Pesa for a reversal\n3. File a report at the nearest police station\n4. Report to the Communications Authority of Kenya\n\nStay safe and happy trading!`,
      excerpt: 'Learn how to identify and avoid online marketplace scams in Kenya. Essential safety tips for both buyers and sellers on ChapKE.',
      coverImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
      authorName: 'ChapKE Team', category: 'Safety', status: 'published',
      tags: JSON.stringify(['safety', 'scams', 'buying', 'selling', 'kenya']),
      seoTitle: 'How to Spot Online Scams When Buying and Selling in Kenya | ChapKE',
      seoDesc: 'Learn how to identify and avoid online marketplace scams in Kenya. Essential safety tips for secure buying and selling on ChapKE.',
    },
    {
      title: 'A Complete Guide to Starting a Small Business in Kenya',
      slug: 'starting-a-small-business-in-kenya',
      content: `# A Complete Guide to Starting a Small Business in Kenya\n\nKenya is a land of opportunity for entrepreneurs. Here is your step-by-step guide to launching a successful small business.\n\n## Step 1: Validate Your Idea\n\nBefore investing money, make sure there is demand:\n- Research your target market\n- Talk to potential customers\n- Analyze competitors on ChapKE\n- Test with a minimum viable product\n\n## Step 2: Register Your Business\n\nIn Kenya, you need to:\n1. Register a business name at eCitizen (KSh 950)\n2. Obtain a KRA PIN for tax compliance\n3. Register for NSSF and NHIF if hiring employees\n4. Get relevant permits from your county government\n\n## Step 3: Source Your Products\n\nFind reliable suppliers:\n- Use ChapKE Business listings to find wholesale suppliers\n- Visit industrial areas like Nairobi's Industrial Area\n- Consider importing from China or Dubai\n- Partner with local farmers or artisans\n\n## Step 4: Set Up Your Online Presence\n\nIn today's market, you must be online:\n- List your products on ChapKE for instant visibility\n- Create a simple website or social media pages\n- Use WhatsApp Business for customer communication\n- Set up M-Pesa till number for payments\n\n## Step 5: Market Your Business\n\nAffordable marketing strategies:\n- Share your ChapKE listings on WhatsApp and Facebook groups\n- Offer referral discounts to early customers\n- Partner with complementary businesses\n- Collect customer reviews and testimonials\n\n## Step 6: Manage Your Finances\n\nKeep your business financially healthy:\n- Separate personal and business accounts\n- Track all income and expenses\n- Set aside money for taxes\n- Reinvest profits for growth\n\nStarting a business is challenging but rewarding. Kenya's economy offers tremendous opportunities for those who persevere!`,
      excerpt: 'A step-by-step guide to starting a small business in Kenya, from idea validation and registration to online marketing and financial management.',
      coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
      authorName: 'Peter Kamau', category: 'Business', status: 'published',
      tags: JSON.stringify(['business', 'entrepreneurship', 'kenya', 'startup']),
      seoTitle: 'Complete Guide to Starting a Small Business in Kenya 2026 | ChapKE',
      seoDesc: 'Learn how to start a small business in Kenya with our step-by-step guide. From registration to marketing, get expert advice for entrepreneurs.',
    },
    {
      title: 'Everything You Need to Know About Car Insurance in Kenya',
      slug: 'car-insurance-kenya-guide',
      content: `# Everything You Need to Know About Car Insurance in Kenya\n\nCar insurance is mandatory in Kenya. Whether buying a new or used car, understanding your insurance options will save you money and headaches.\n\n## Types of Car Insurance\n\n**Third Party Only** – The minimum legal requirement. Covers damage to other people's vehicles and property but not your own.\n\n**Third Party, Fire & Theft** – Covers third-party damage plus fire damage and theft of your vehicle.\n\n**Comprehensive** – The most extensive coverage. Covers your vehicle, third-party, fire, theft, and sometimes personal accident.\n\n## How Much Does Insurance Cost?\n\nPremiums depend on:\n- Vehicle value (higher value = higher premium)\n- Age of the car (older cars may have higher rates)\n- Your driving history\n- Location (Nairobi premiums are typically higher)\n- Security features (tracker, alarm)\n\n## Tips for Finding Affordable Insurance\n\n1. Compare quotes from at least 3 insurance companies\n2. Consider a higher excess (deductible) to lower premiums\n3. Install a vehicle tracking device for discounts\n4. Bundle insurance policies for multi-vehicle discounts\n5. Maintain a clean driving record\n\n## Making a Claim\n\nIf you are in an accident:\n1. Do not admit fault at the scene\n2. Take photos of the damage\n3. Get a police abstract (required for claims)\n4. Contact your insurance provider within 24 hours\n5. Visit a recommended garage for assessment\n\n## Top Insurance Companies in Kenya\n\n- APA Insurance\n- Jubilee Insurance\n- CIC Insurance\n- Britam\n- UAP Old Mutual\n\nDrive safely and stay protected on Kenyan roads!`,
      excerpt: 'A comprehensive guide to car insurance in Kenya covering types of coverage, costs, tips for affordable premiums, and how to file a claim.',
      coverImage: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80',
      authorName: 'James Mwangi', category: 'Vehicles', status: 'published',
      tags: JSON.stringify(['car-insurance', 'vehicles', 'kenya', 'guide']),
      seoTitle: 'Car Insurance in Kenya – Complete Guide 2026 | ChapKE Blog',
      seoDesc: 'Everything you need to know about car insurance in Kenya. Compare comprehensive, third-party, and fire & theft coverage options and save money.',
    },
    {
      title: 'How to Take Great Product Photos for Your Listings',
      slug: 'product-photography-tips',
      content: `# How to Take Great Product Photos for Your Listings\n\nGreat photos can increase your listing views by 3x or more. Here is how to take professional-looking product photos with just your phone.\n\n## Use Natural Light\n\nNatural lighting is your best friend:\n- Shoot near a window during daytime\n- Avoid direct sunlight (creates harsh shadows)\n- Cloudy days provide soft, diffused light\n- Use a white reflector (or cardboard) to bounce light\n\n## Clean Your Background\n\nA cluttered background distracts from your item:\n- Use a plain white wall or a clean table\n- A white or black poster board works perfectly\n- For small items, use a clean countertop\n- Remove personal items from the frame\n\n## Shoot from Multiple Angles\n\nShow every important detail:\n- Front, back, left, and right sides\n- Close-ups of any defects or wear\n- Brand labels and tags\n- Accessories included in the sale\n- The item in use (for context)\n\n## Camera Settings for Best Results\n\nMost smartphones can take excellent photos:\n- Clean your lens with a soft cloth\n- Tap to focus on the item\n- Use the highest resolution setting\n- Turn on HDR mode for balanced exposure\n- Avoid digital zoom (move closer instead)\n\n## Edit for Perfection\n\nBasic edits make a big difference:\n- Crop to remove empty space\n- Adjust brightness and contrast\n- Straighten crooked angles\n- Use free apps like Snapseed or Canva\n\n## Common Mistakes to Avoid\n\n- Blurry photos (hold steady or use a tripod)\n- Watermarks or dates on photos\n- Dark, underexposed images\n- Including yourself or others in reflections\n- Using stock photos instead of real images\n\nFollow these tips and your ChapKE listings will stand out from the competition!`,
      excerpt: 'Learn how to take stunning product photos with your smartphone. Boost your ChapKE listing views with these simple photography tips.',
      coverImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
      authorName: 'ChapKE Team', category: 'Selling Tips', status: 'published',
      tags: JSON.stringify(['photography', 'selling', 'tips', 'product-photos']),
      seoTitle: 'How to Take Great Product Photos for Your ChapKE Listings | ChapKE',
      seoDesc: 'Learn how to take professional product photos with your smartphone. Simple tips for lighting, backgrounds, angles, and editing to sell faster.',
    },
    {
      title: 'The Best Neighborhoods to Live in Nairobi in 2026',
      slug: 'best-neighborhoods-nairobi-2026',
      content: `# The Best Neighborhoods to Live in Nairobi in 2026\n\nNairobi continues to grow and evolve. Here are the best neighborhoods to consider for your next move in 2026.\n\n## 1. Kilimani\n\n**Best for:** Young professionals and families  \n**Average 2BR rent:** KSh 45,000-80,000  \nKilimani offers a perfect blend of tranquility and convenience. It is close to the CBD, has excellent schools, and a vibrant social scene.\n\n## 2. Kitisuru\n\n**Best for:** Families seeking space  \n**Average 2BR rent:** KSh 50,000-90,000  \nKitisuru offers larger compounds, greener surroundings, and proximity to international schools. Popular with diplomats and executives.\n\n## 3. South B / South C\n\n**Best for:** Families, established communities  \n**Average 2BR rent:** KSh 25,000-50,000  \nThese established neighborhoods offer spacious apartments, good security, and easy access to the CBD and Jomo Kenyatta International Airport.\n\n## 4. Westlands\n\n**Best for:** Nightlife and entertainment  \n**Average 2BR rent:** KSh 60,000-120,000  \nWestlands is the entertainment hub of Nairobi with restaurants, clubs, and shopping malls. Ideal for those who enjoy city living.\n\n## 5. Ruaka\n\n**Best for:** Affordable modern living  \n**Average 2BR rent:** KSh 20,000-40,000  \nRuaka has seen massive development with modern apartments at affordable prices. Growing rapidly with new malls and schools.\n\n## 6. Langata\n\n**Best for:** Nature lovers  \n**Average 2BR rent:** KSh 30,000-60,000  \nHome to Nairobi National Park, Lang'ata offers a quieter lifestyle with access to nature. Great for families who love outdoor activities.\n\n## Factors to Consider\n\nWhen choosing a neighborhood, think about:\n- Commute time to work or school\n- Security situation\n- Access to public transport\n- Availability of water and utilities\n- Proximity to shopping and healthcare\n\nBrowse ChapKE's property section to find available rentals in these neighborhoods!`,
      excerpt: 'Discover the best neighborhoods to live in Nairobi in 2026. Compare Kilimani, Westlands, Ruaka, and more based on lifestyle and budget.',
      coverImage: 'https://images.unsplash.com/photo-1580584127374-3f5e1b47c7e5?w=800&q=80',
      authorName: 'Grace Wanjiku', category: 'Property', status: 'published',
      tags: JSON.stringify(['nairobi', 'neighborhoods', 'property', 'living']),
      seoTitle: 'Best Neighborhoods to Live in Nairobi 2026 | ChapKE Property Guide',
      seoDesc: 'Discover the best neighborhoods in Nairobi for 2026. Compare Kilimani, Westlands, Ruaka, Kitisuru, and more for your next rental or home.',
    },
    {
      title: 'A Guide to Negotiating Prices Like a Pro',
      slug: 'negotiating-prices-guide',
      content: `# A Guide to Negotiating Prices Like a Pro\n\nNegotiation is an essential skill when buying and selling on ChapKE. Here is how to get the best deal without offending anyone.\n\n## For Buyers: How to Negotiate\n\n### Do Your Research\n\nBefore making an offer, know the market value:\n- Compare similar listings on ChapKE\n- Check the item's retail price\n- Factor in age and condition\n- Consider any repairs needed\n\n### Make a Reasonable Offer\n\nStart at about 70-80% of the asking price for most items. Very low offers can offend sellers and end negotiations before they start.\n\n### Be Polite and Professional\n\nA friendly message goes a long way:\n> "Hi, I am interested in your [item]. Would you consider KSh [amount]? I can pick it up today."\n\n### Highlight Your Strengths\n\nMention why the seller should accept your offer:\n- "I can pay cash today"\n- "I will pick it up myself"\n- "No need to deliver"\n\n## For Sellers: How to Handle Negotiations\n\n### Price Strategically\n\nList your item 10-15% above your minimum acceptable price to leave room for negotiation.\n\n### Know Your Bottom Line\n\nDecide the lowest price you will accept before negotiations begin. Do not go below it.\n\n### Use Scarcity\n\nMention that other buyers are interested (if true). This creates urgency.\n\n### Bundle Deals\n\nIf a buyer wants a discount, offer to include accessories or offer free delivery instead.\n\n## What NOT to Do\n\n- Do not get emotional about the price\n- Do not insult the other party's item\n- Do not make offers you cannot honor\n- Do not disappear after reaching an agreement\n\nMaster these techniques and you will save thousands on ChapKE!`,
      excerpt: 'Master the art of negotiation on ChapKE. Learn how to make offers, handle counteroffers, and close deals like a pro.',
      coverImage: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80',
      authorName: 'Peter Kamau', category: 'Buying Tips', status: 'published',
      tags: JSON.stringify(['negotiation', 'buying', 'selling', 'tips']),
      seoTitle: 'How to Negotiate Prices Like a Pro on ChapKE | ChapKE Guide',
      seoDesc: 'Learn how to negotiate prices effectively on ChapKE. Expert tips for buyers and sellers to get the best deals on Kenya premier marketplace.',
    },
    {
      title: 'How to Write a Listing That Sells – Tips and Examples',
      slug: 'write-a-listing-that-sells',
      content: `# How to Write a Listing That Sells – Tips and Examples\n\nYour listing title and description are your sales pitch. Here is how to write listings that attract buyers and close deals.\n\n## Writing the Perfect Title\n\nYour title is the first thing buyers see. Make it count:\n\n**Good:** "Samsung Galaxy S23 Ultra"  \n**Great:** "Samsung Galaxy S23 Ultra 256GB – Phantom Black – Excellent Condition – Box & Charger Included"\n\nTips for great titles:\n- Include brand and model\n- Mention key specs (size, color, storage)\n- Add condition (New, Like New, Good)\n- Keep under 80 characters\n- Avoid ALL CAPS and special characters\n\n## Writing a Compelling Description\n\nStructure your description for easy reading:\n\n### Opening Sentence\nStart with the most compelling feature. Example: "This Toyota Vitz 2018 has only 40,000km and comes with a full service history."\n\n### Key Details (Bullet Points)\nUse bullet points for easy scanning:\n- Brand and model\n- Year of manufacture\n- Mileage / usage\n- Condition details\n- Inclusions (charger, case, warranty)\n- Reason for selling\n\n### Condition Transparency\nBe honest about any defects. Mentioning them upfront builds trust and reduces questions.\n\n### Call to Action\nEnd with a clear next step: "Call or WhatsApp 0712 345 678 for viewing. Cash on delivery available."\n\n## Example: Good vs Great\n\n**Good Description:**  \n"Selling my phone. It is in good condition. Price is negotiable. Call me."\n\n**Great Description:**  \n"iPhone 13 Pro Max 256GB in Sierra Blue. Used for 6 months, always in a case with a screen protector. Battery health at 98%. Includes original box, charger, and a Spigen case. Selling because I upgraded to the new model. Viewing in Westlands. Call or WhatsApp 0712 345 678."\n\n## Quick Checklist\n\nBefore publishing, check that your listing has:\n- [ ] Clear, accurate title\n- [ ] Complete description\n- [ ] Multiple photos\n- [ ] Fair price\n- [ ] Correct category\n- [ ] Contact information\n\nWrite better listings, sell faster on ChapKE!`,
      excerpt: 'Learn how to write ChapKE listings that sell. Includes examples of good vs great titles and descriptions to attract more buyers.',
      coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
      authorName: 'ChapKE Team', category: 'Selling Tips', status: 'published',
      tags: JSON.stringify(['writing', 'listings', 'selling', 'tips', 'examples']),
      seoTitle: 'How to Write a ChapKE Listing That Sells – Tips & Examples | ChapKE',
      seoDesc: 'Learn how to write compelling listings on ChapKE that attract buyers and close deals. Includes examples of good vs great titles and descriptions.',
    },
  ];
  for (const post of blogPosts) {
    await db.blogPost.upsert({
      where: { slug: post.slug },
      update: { updatedAt: new Date() },
      create: { ...post, publishedAt: new Date() },
    });
    console.log(`  Created blog post: ${post.title}`);
  }

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