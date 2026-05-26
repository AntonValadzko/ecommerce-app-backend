import type { DataSource } from 'typeorm';
import type Database from 'better-sqlite3';

const CATEGORIES = [
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

const BRANDS_BY_CATEGORY: Record<string, string[]> = {
  electronics: ['TechPro', 'NovaGear', 'PixelWave', 'CoreLink'],
  clothing: ['UrbanThread', 'ComfortCo', 'StylePeak', 'DenimWorks'],
  'home-garden': ['HomeNest', 'GreenLeaf', 'CraftHaus', 'RoomBright'],
  sports: ['ActiveFit', 'TrailMax', 'PeakSport', 'FlexZone'],
  beauty: ['GlowLab', 'PureSkin', 'LuxeCare', 'FreshFace'],
  books: ['PageTurner', 'StoryHouse', 'InkPress', 'ReadWell'],
  toys: ['PlayMakers', 'FunBox', 'KidJoy', 'WonderToys'],
  automotive: ['AutoParts+', 'DriveRight', 'MotorMax', 'RoadReady'],
  health: ['VitaBoost', 'WellPath', 'NaturePure', 'FitLife'],
  food: ['FarmFresh', 'GourmetCo', 'SnackBox', 'OrganicTable'],
};

const ATTRIBUTE_TEMPLATES: Record<string, { name: string; values: string[] }[]> = {
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

const PRODUCT_NAMES: Record<string, string[]> = {
  electronics: ['Wireless Earbuds Pro', 'Smart Watch Series X', '4K Webcam HD', 'Bluetooth Speaker Mini', 'USB-C Hub Deluxe', 'Mechanical Keyboard RGB', 'Portable SSD 1TB', 'Tablet Stand Adjustable', 'Noise Cancelling Headphones', 'Smart Home Plug'],
  clothing: ['Classic Fit Oxford Shirt', 'Slim Denim Jeans', 'Wool Blend Sweater', 'Running Shorts Lite', 'Leather Belt Premium', 'Cotton Hoodie Essential', 'Linen Summer Dress', 'Athletic Performance Tee', 'Waterproof Rain Jacket', 'Cashmere Scarf'],
  'home-garden': ['Ceramic Planter Set', 'LED Desk Lamp Modern', 'Memory Foam Pillow', 'Stainless Steel Cookware', 'Throw Blanket Cozy', 'Wall Clock Minimalist', 'Garden Tool Kit', 'Scented Candle Collection', 'Storage Basket Woven', 'Kitchen Knife Block'],
  sports: ['Yoga Mat Premium', 'Resistance Bands Set', 'Camping Tent 4-Person', 'Hiking Backpack 40L', 'Cycling Helmet Pro', 'Dumbbell Set Adjustable', 'Tennis Racket Carbon', 'Swim Goggles Anti-Fog', 'Fitness Tracker Band', 'Soccer Ball Official'],
  beauty: ['Hydrating Face Serum', 'Matte Lipstick Set', 'Vitamin C Moisturizer', 'Shampoo Repair Formula', 'Sunscreen SPF 50', 'Eyeshadow Palette Nude', 'Body Lotion Shea Butter', 'Anti-Aging Night Cream', 'Perfume Eau de Parfum', 'Facial Cleansing Brush'],
  books: ['Mystery Thriller Bestseller', 'Cookbook Mediterranean', 'Science Fiction Anthology', 'Self-Help Productivity Guide', 'Children Picture Book', 'History World Wars', 'Poetry Collection Modern', 'Biography Innovators', 'Travel Guide Europe', 'Graphic Novel Adventure'],
  toys: ['Building Blocks Creative', 'Board Game Strategy', 'Remote Control Car', 'Plush Teddy Bear', 'Art Supplies Kit', 'Puzzle 1000 Pieces', 'Action Figure Set', 'Doll House Deluxe', 'Science Experiment Kit', 'Outdoor Bubble Machine'],
  automotive: ['All-Season Floor Mats', 'Phone Mount Dashboard', 'LED Headlight Bulbs', 'Car Vacuum Portable', 'Seat Cover Universal', 'Jump Starter Power Bank', 'Tire Pressure Gauge Digital', 'Air Freshener Vent Clip', 'Windshield Sun Shade', 'Cargo Organizer Trunk'],
  health: ['Multivitamin Daily', 'Protein Powder Whey', 'Omega-3 Fish Oil', 'Probiotic Complex', 'Collagen Peptides', 'Electrolyte Drink Mix', 'Resistance Loop Bands', 'Foam Roller Recovery', 'Sleep Aid Melatonin', 'Green Superfood Powder'],
  food: ['Organic Coffee Beans', 'Extra Virgin Olive Oil', 'Dark Chocolate Bar', 'Granola Mix Crunchy', 'Herbal Tea Sampler', 'Pasta Artisan Selection', 'Honey Raw Wildflower', 'Nut Butter Almond', 'Protein Snack Bars', 'Spice Blend Gourmet'],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export async function runSeed(dataSource: DataSource): Promise<void> {
  const db = (dataSource.driver as unknown as { databaseConnection: Database.Database })
    .databaseConnection;

  const insertCategory = db.prepare(
    'INSERT INTO categories (slug, name, description) VALUES (@slug, @name, @description)',
  );
  const insertProduct = db.prepare(`
    INSERT INTO products (
      sku, name, slug, description, brand, category_id, price, compare_at_price,
      currency, rating, review_count, in_stock, stock_quantity, popularity_score, image_url
    ) VALUES (
      @sku, @name, @slug, @description, @brand, @categoryId, @price, @compareAtPrice,
      'USD', @rating, @reviewCount, @inStock, @stockQuantity, @popularityScore, @imageUrl
    )
  `);
  const insertAttr = db.prepare(
    'INSERT INTO product_attributes (product_id, name, value) VALUES (@productId, @name, @value)',
  );

  const seed = db.transaction(() => {
    db.exec('DELETE FROM product_attributes');
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM categories');

    const categoryIds: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      const result = insertCategory.run(cat);
      categoryIds[cat.slug] = Number(result.lastInsertRowid);
    }

    let productIndex = 0;
    for (const cat of CATEGORIES) {
      const names = PRODUCT_NAMES[cat.slug] ?? [];
      const brands = BRANDS_BY_CATEGORY[cat.slug] ?? ['Generic'];
      const attrs = ATTRIBUTE_TEMPLATES[cat.slug] ?? [];

      for (let i = 0; i < 10; i++) {
        productIndex++;
        const baseName = names[i] ?? `${cat.name} Product ${i + 1}`;
        const brand = brands[i % brands.length]!;
        const slug = `${slugify(baseName)}-${productIndex}`;
        const sku = `SKU-${cat.slug.toUpperCase().slice(0, 3)}-${String(productIndex).padStart(4, '0')}`;
        const price = Math.round((15 + Math.random() * 485) * 100) / 100;
        const hasDiscount = Math.random() > 0.6;
        const compareAtPrice = hasDiscount
          ? Math.round(price * (1.1 + Math.random() * 0.4) * 100) / 100
          : null;
        const rating = Math.round((2.5 + Math.random() * 2.5) * 10) / 10;
        const reviewCount = Math.floor(Math.random() * 2500);
        const inStock = Math.random() > 0.12 ? 1 : 0;
        const stockQuantity = inStock ? Math.floor(Math.random() * 500) + 1 : 0;
        const popularityScore = Math.floor(Math.random() * 10000);

        const result = insertProduct.run({
          sku,
          name: baseName,
          slug,
          description: `Premium ${baseName} from ${brand}. Ideal for everyday use in the ${cat.name} category. Features high-quality materials and excellent value.`,
          brand,
          categoryId: categoryIds[cat.slug],
          price,
          compareAtPrice,
          rating,
          reviewCount,
          inStock,
          stockQuantity,
          popularityScore,
          imageUrl: `https://picsum.photos/seed/${slug}/400/400`,
        });

        const productId = Number(result.lastInsertRowid);
        for (const attrDef of attrs) {
          insertAttr.run({ productId, name: attrDef.name, value: pick(attrDef.values) });
        }
      }
    }

    db.exec(`INSERT INTO products_fts(products_fts) VALUES('rebuild')`);
  });

  seed();
  console.log('Seeded 100 products across 10 categories.');
}
