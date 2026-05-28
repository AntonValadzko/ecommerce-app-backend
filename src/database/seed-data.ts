export const CATEGORIES = [
  { slug: 'electronics', name: 'Electronics', description: 'Gadgets and devices' },
  { slug: 'clothing', name: 'Clothing', description: 'Apparel for all seasons' },
  { slug: 'home-garden', name: 'Home & Garden', description: 'Home improvement and decor' },
  { slug: 'sports', name: 'Sports & Outdoors', description: 'Athletic gear and outdoor equipment' },
  { slug: 'beauty', name: 'Beauty & Personal Care', description: 'Skincare and cosmetics' },
  { slug: 'books', name: 'Books & Media', description: 'Books, music, and movies' },
  { slug: 'toys', name: 'Toys & Games', description: 'Fun for all ages' },
  { slug: 'automotive', name: 'Automotive', description: 'Car parts and accessories' },
  { slug: 'health', name: 'Health & Wellness', description: 'Vitamins and fitness' },
  { slug: 'food', name: 'Grocery & Gourmet', description: 'Food and beverages' },
];

/** Inclusive range — each category gets a random count in this band on seed. */
export const MIN_PRODUCTS_PER_CATEGORY = 15;
export const MAX_PRODUCTS_PER_CATEGORY = 38;

export const BRANDS_BY_CATEGORY: Record<string, string[]> = {
  electronics: ['TechPro', 'NovaGear', 'PixelWave', 'CoreLink', 'VoltEdge', 'SyncBit'],
  clothing: ['UrbanThread', 'ComfortCo', 'StylePeak', 'DenimWorks', 'NorthLoom', 'BareStep'],
  'home-garden': ['HomeNest', 'GreenLeaf', 'CraftHaus', 'RoomBright', 'TerraForm', 'HearthCo'],
  sports: ['ActiveFit', 'TrailMax', 'PeakSport', 'FlexZone', 'SummitLab', 'PulseRun'],
  beauty: ['GlowLab', 'PureSkin', 'LuxeCare', 'FreshFace', 'VelvetTone', 'BloomTheory'],
  books: ['PageTurner', 'StoryHouse', 'InkPress', 'ReadWell', 'ChapterOne', 'QuillMark'],
  toys: ['PlayMakers', 'FunBox', 'KidJoy', 'WonderToys', 'BrightPlay', 'TinyQuest'],
  automotive: ['AutoParts+', 'DriveRight', 'MotorMax', 'RoadReady', 'GaragePro', 'TorqueLine'],
  health: ['VitaBoost', 'WellPath', 'NaturePure', 'FitLife', 'CoreVital', 'ZenNutri'],
  food: ['FarmFresh', 'GourmetCo', 'SnackBox', 'OrganicTable', 'HarvestPantry', 'SavoryLane'],
};

export const ATTRIBUTE_TEMPLATES: Record<string, { name: string; values: string[] }[]> = {
  electronics: [
    { name: 'color', values: ['Black', 'White', 'Silver', 'Blue'] },
    { name: 'storage', values: ['64GB', '128GB', '256GB', '512GB'] },
  ],
  clothing: [
    { name: 'size', values: ['XS', 'S', 'M', 'L', 'XL'] },
    { name: 'color', values: ['Black', 'Navy', 'Red', 'Green', 'Beige'] },
    { name: 'material', values: ['Cotton', 'Polyester', 'Wool', 'Linen'] },
  ],
  'home-garden': [
    { name: 'color', values: ['White', 'Gray', 'Brown', 'Green'] },
    { name: 'material', values: ['Wood', 'Metal', 'Plastic', 'Ceramic'] },
  ],
  sports: [
    { name: 'size', values: ['S', 'M', 'L', 'XL'] },
    { name: 'color', values: ['Black', 'Blue', 'Red', 'Orange'] },
  ],
  beauty: [
    { name: 'size', values: ['30ml', '50ml', '100ml', '200ml'] },
    { name: 'skin_type', values: ['Dry', 'Oily', 'Combination', 'Sensitive'] },
  ],
  books: [
    { name: 'format', values: ['Hardcover', 'Paperback', 'E-book', 'Audiobook'] },
    { name: 'language', values: ['English', 'Spanish', 'French', 'German'] },
  ],
  toys: [
    { name: 'age_range', values: ['3-5', '6-8', '9-12', '13+'] },
    { name: 'color', values: ['Multicolor', 'Red', 'Blue', 'Yellow'] },
  ],
  automotive: [
    { name: 'compatibility', values: ['Universal', 'Sedan', 'SUV', 'Truck'] },
    { name: 'material', values: ['Rubber', 'Steel', 'Plastic', 'Aluminum'] },
  ],
  health: [
    { name: 'form', values: ['Capsules', 'Tablets', 'Powder', 'Liquid'] },
    { name: 'count', values: ['30', '60', '90', '120'] },
  ],
  food: [
    { name: 'weight', values: ['250g', '500g', '1kg', '2kg'] },
    { name: 'diet', values: ['Organic', 'Gluten-Free', 'Vegan', 'Keto'] },
  ],
};

export const PRODUCT_NAMES: Record<string, string[]> = {
  electronics: [
    'Wireless Earbuds Pro', 'Smart Watch Series X', '4K Webcam HD', 'Bluetooth Speaker Mini',
    'USB-C Hub Deluxe', 'Mechanical Keyboard RGB', 'Portable SSD 1TB', 'Tablet Stand Adjustable',
    'Noise Cancelling Headphones', 'Smart Home Plug', 'Gaming Mouse Wireless', '27-inch Monitor 4K',
    'Laptop Sleeve Premium', 'Phone Tripod Flexible', 'Power Bank 20000mAh', 'True Wireless Earphones Sport',
    'Smart Ring Fitness', 'Document Camera Scanner', 'LED Ring Light Studio', 'NAS Drive 4-Bay',
    'Ergonomic Vertical Mouse', 'Bluetooth Tracker Tags', 'Mini Projector Portable', 'USB Microphone Podcast',
    'Graphics Tablet Drawing', 'Smart Doorbell Camera', 'Robot Vacuum Compact', 'WiFi Range Extender',
    'Electric Standing Desk', 'Portable Monitor 15', 'Action Camera 4K', 'Smart Thermostat',
    'Wireless Charging Pad', 'HDMI Switch 4-Port', 'Cable Management Kit', 'Laptop Cooling Pad',
    'Smart Light Bulbs 4-Pack', 'Digital Photo Frame', 'Portable Bluetooth Keyboard', 'Ethernet Switch Gigabit',
  ],
  clothing: [
    'Classic Fit Oxford Shirt', 'Slim Denim Jeans', 'Wool Blend Sweater', 'Running Shorts Lite',
    'Leather Belt Premium', 'Cotton Hoodie Essential', 'Linen Summer Dress', 'Athletic Performance Tee',
    'Waterproof Rain Jacket', 'Cashmere Scarf', 'Chino Pants Stretch', 'Flannel Shirt Brushed',
    'Puffer Vest Lightweight', 'Merino Base Layer', 'Cargo Joggers Urban', 'Silk Blouse Elegant',
    'Bomber Jacket Nylon', 'Polo Shirt Pique', 'Maxi Skirt Flowy', 'Thermal Socks 3-Pack',
    'Windbreaker Packable', 'Cardigan Button Front', 'High-Rise Leggings', 'Denim Jacket Classic',
    'Dress Shirt Non-Iron', 'Swim Trunks Quick-Dry', 'Knit Beanie Ribbed', 'Blazer Slim Fit',
    'Wide-Leg Trousers', 'Graphic Tee Vintage', 'Fleece Quarter-Zip', 'Midi Wrap Dress',
    'Leather Ankle Boots', 'Sports Bra High Support', 'Trench Coat Belted', 'Corduroy Pants',
  ],
  'home-garden': [
    'Ceramic Planter Set', 'LED Desk Lamp Modern', 'Memory Foam Pillow', 'Stainless Steel Cookware',
    'Throw Blanket Cozy', 'Wall Clock Minimalist', 'Garden Tool Kit', 'Scented Candle Collection',
    'Storage Basket Woven', 'Kitchen Knife Block', 'Robot Vacuum Bags', 'Shower Curtain Set',
    'Area Rug Geometric', 'Coffee Table Oak', 'Herb Garden Starter', 'Blackout Curtains Pair',
    'Stand Mixer Attachment', 'Outdoor String Lights', 'Compost Bin Kitchen', 'Bath Towel Set',
    'Floating Shelves Wood', 'Dutch Oven Enameled', 'Welcome Mat Coir', 'Bed Sheet Set Cotton',
    'Watering Can Galvanized', 'Picture Frame Gallery', 'Cutting Board Bamboo', 'Clothes Drying Rack',
    'Fire Pit Tabletop', 'Drawer Organizer Set', 'Hammock Chair Macrame', 'Vacuum Storage Bags',
    'Door Draft Stopper', 'Spice Rack Wall Mount', 'Garden Hose Expandable', 'Night Light Motion',
  ],
  sports: [
    'Yoga Mat Premium', 'Resistance Bands Set', 'Camping Tent 4-Person', 'Hiking Backpack 40L',
    'Cycling Helmet Pro', 'Dumbbell Set Adjustable', 'Tennis Racket Carbon', 'Swim Goggles Anti-Fog',
    'Fitness Tracker Band', 'Soccer Ball Official', 'Trail Running Shoes', 'Foam Roller High Density',
    'Kayak Paddle Aluminum', 'Climbing Chalk Bag', 'Golf Balls 12-Pack', 'Basketball Indoor',
    'Ski Goggles OTG', 'Boxing Gloves Training', 'Jump Rope Speed', 'Camping Stove Portable',
    'Mountain Bike Gloves', 'Pilates Ring Circle', 'Surfboard Wax Bar', 'Archery Target Foam',
    'Rowing Machine Cover', 'Badminton Set Family', 'Skateboard Complete', 'Hydration Vest Running',
    'Fishing Tackle Box', 'Volleyball Beach', 'Snowboard Boots', 'Agility Ladder Training',
    'Pickleball Paddle Set', 'Inline Skates Adult', 'Weighted Vest 10kg', 'Cooler Backpack Insulated',
  ],
  beauty: [
    'Hydrating Face Serum', 'Matte Lipstick Set', 'Vitamin C Moisturizer', 'Shampoo Repair Formula',
    'Sunscreen SPF 50', 'Eyeshadow Palette Nude', 'Body Lotion Shea Butter', 'Anti-Aging Night Cream',
    'Perfume Eau de Parfum', 'Facial Cleansing Brush', 'Retinol Treatment Oil', 'Mascara Volume Black',
    'Clay Face Mask Detox', 'Lip Gloss Trio', 'Eye Cream Caffeine', 'Dry Shampoo Refresh',
    'Blush Stick Cream', 'Nail Polish Kit', 'Makeup Sponge Set', 'Hair Straightener Ceramic',
    'Setting Spray Matte', 'Brow Gel Tinted', 'Hand Cream Intensive', 'Exfoliating Body Scrub',
    'Highlighter Powder Duo', 'Curling Wand 32mm', 'Micellar Water Gentle', 'BB Cream SPF 30',
    'Cuticle Oil Pen', 'Sheet Mask 10-Pack', 'Concealer Full Coverage', 'Beard Oil Sandalwood',
    'Perfume Roller Travel', 'Lash Curler Heated', 'Toner Balancing', 'Bronzer Sun-Kissed',
  ],
  books: [
    'Mystery Thriller Bestseller', 'Cookbook Mediterranean', 'Science Fiction Anthology', 'Self-Help Productivity Guide',
    'Children Picture Book', 'History World Wars', 'Poetry Collection Modern', 'Biography Innovators',
    'Travel Guide Europe', 'Graphic Novel Adventure', 'Fantasy Epic Hardcover', 'True Crime Investigation',
    'Romance Novel Series', 'Business Leadership', 'Art History Illustrated', 'Philosophy Introduction',
    'Young Adult Dystopia', 'Classic Literature Box', 'Mindfulness Journal', 'Photography Techniques',
    'Horror Short Stories', 'Gardening Handbook', 'Language Learning Spanish', 'Architecture Monograph',
    'Comic Strip Collection', 'Parenting Toddlers', 'Economics Explained', 'Wildlife Field Guide',
    'Memoir Mountain Climb', 'Chess Strategy Master', 'Wine Enthusiast Guide', 'Coding for Beginners',
    'Mythology Retold', 'Climate Science Report', 'Detective Noir Series', 'Nutrition Science',
  ],
  toys: [
    'Building Blocks Creative', 'Board Game Strategy', 'Remote Control Car', 'Plush Teddy Bear',
    'Art Supplies Kit', 'Puzzle 1000 Pieces', 'Action Figure Set', 'Doll House Deluxe',
    'Science Experiment Kit', 'Outdoor Bubble Machine', 'LEGO-Style Space Set', 'Card Game Family',
    'RC Drone Mini', 'Wooden Train Track', 'Slime Making Kit', 'Nerf Blaster Elite',
    'Play Kitchen Wooden', 'Magic Trick Set', 'Kite Rainbow Large', 'Musical Keyboard Kids',
    'Marble Run Tower', 'Stuffed Dinosaur XL', 'Craft Bead Jewelry', 'Soccer Table Foosball',
    'Robot Dog Interactive', 'Painting Easel Adjustable', 'Balance Bike No-Pedal', 'Treasure Hunt Game',
    'Magnetic Tiles 100pc', 'Puppet Theater Fabric', 'Water Table Sandbox', 'Coding Robot Starter',
    'Jigsaw Puzzle 500pc', 'Collectible Trading Cards', 'Bubble Tea Play Set', 'Archery Toy Suction',
  ],
  automotive: [
    'All-Season Floor Mats', 'Phone Mount Dashboard', 'LED Headlight Bulbs', 'Car Vacuum Portable',
    'Seat Cover Universal', 'Jump Starter Power Bank', 'Tire Pressure Gauge Digital', 'Air Freshener Vent Clip',
    'Windshield Sun Shade', 'Cargo Organizer Trunk', 'Dash Cam Front Rear', 'Microfiber Wash Mitt',
    'Roof Rack Crossbars', 'OBD2 Scanner Bluetooth', 'Cup Holder Expander', 'License Plate Frame',
    'Blind Spot Mirrors', 'Trunk LED Strip', 'Steering Wheel Cover', 'Car Cover Outdoor',
    'Battery Maintainer Smart', 'Wheel Cleaner Kit', 'Emergency Road Kit', 'Seat Gap Filler',
    'Hitch Cargo Carrier', 'Ceramic Coating Spray', 'Tire Inflator Portable', 'Backseat Organizer Kids',
    'Rain Repellent Glass', 'Key Finder Bluetooth', 'Mud Flaps Universal', 'Trunk Mat Custom Fit',
    'Portable Air Compressor', 'Sunroof Wind Deflector', 'Car Diffuser Ultrasonic', 'Pet Seat Cover',
  ],
  health: [
    'Multivitamin Daily', 'Protein Powder Whey', 'Omega-3 Fish Oil', 'Probiotic Complex',
    'Collagen Peptides', 'Electrolyte Drink Mix', 'Resistance Loop Bands', 'Foam Roller Recovery',
    'Sleep Aid Melatonin', 'Green Superfood Powder', 'Vitamin D3 K2', 'Magnesium Glycinate',
    'BCAA Recovery Drink', 'Apple Cider Vinegar Gummies', 'Turmeric Curcumin', 'Zinc Immune Support',
    'Plant Protein Vanilla', 'Fiber Supplement Psyllium', 'CoQ10 Heart Health', 'Ashwagandha Capsules',
    'Creatine Monohydrate', 'Joint Support Glucosamine', 'Iron Supplement Gentle', 'Biotin Hair Skin',
    'Prebiotic Fiber Powder', 'Elderberry Syrup', 'L-Theanine Calm', 'Bone Broth Protein',
    'Electrolyte Tablets', 'Spirulina Organic', 'Berberine Metabolic', 'Collagen Gummies',
    'Massage Gun Percussion', 'Yoga Wheel Back', 'Meditation Cushion', 'Acupressure Mat',
  ],
  food: [
    'Organic Coffee Beans', 'Extra Virgin Olive Oil', 'Dark Chocolate Bar', 'Granola Mix Crunchy',
    'Herbal Tea Sampler', 'Pasta Artisan Selection', 'Honey Raw Wildflower', 'Nut Butter Almond',
    'Protein Snack Bars', 'Spice Blend Gourmet', 'Sourdough Bread Mix', 'Cold Brew Concentrate',
    'Basmati Rice Premium', 'Hot Sauce Trio', 'Dried Mango Organic', 'Matcha Powder Ceremonial',
    'Balsamic Vinegar Aged', 'Trail Mix Deluxe', 'Coconut Water Case', 'Pickles Artisan Jar',
    'Quinoa Tri-Color', 'Maple Syrup Grade A', 'Ramen Noodle Variety', 'Olive Tapenade',
    'Cashews Roasted Salted', 'Tomato Passata Organic', 'Energy Bites Chocolate', 'Kimchi Fermented',
    'Sparkling Water Lime', 'Ghee Clarified Butter', 'Chia Seeds Organic', 'Salsa Verde Medium',
    'Instant Oatmeal Apple', 'Smoked Salmon Pack', 'Curry Paste Red', 'Popcorn Kernels Heritage',
    'Fig Jam Small Batch', 'Beef Jerky Grass-Fed', 'Rice Noodles Gluten-Free', 'Truffle Oil White',
  ],
};

const VARIANT_SUFFIXES = [
  'Plus', 'Pro', 'Elite', 'Lite', 'Max', 'Studio', 'Travel', 'Home', 'Sport', 'Classic',
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function randomProductCountPerCategory(): number {
  return (
    MIN_PRODUCTS_PER_CATEGORY +
    Math.floor(Math.random() * (MAX_PRODUCTS_PER_CATEGORY - MIN_PRODUCTS_PER_CATEGORY + 1))
  );
}

/** Resolve product display name; cycles catalog and adds variants when count exceeds list length. */
export function resolveProductName(categorySlug: string, indexInCategory: number): string {
  const names = PRODUCT_NAMES[categorySlug] ?? [];
  if (!names.length) return `Product ${indexInCategory + 1}`;

  const base = names[indexInCategory % names.length]!;
  if (indexInCategory < names.length) return base;

  const variant = VARIANT_SUFFIXES[Math.floor(indexInCategory / names.length) % VARIANT_SUFFIXES.length];
  return `${base} ${variant}`;
}
