/**
 * Stable product images via Lorem Picsum (seeded URL per product).
 * Unsplash IDs in seed data were often invalid (404); picsum seeds are reliable.
 */

const W = 400;
const H = 400;

function imageUrl(seed: string): string {
  const safe = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `https://picsum.photos/seed/${encodeURIComponent(safe)}/${W}/${H}`;
}

interface SeedRule {
  keywords: string[];
  seedPrefix: string;
}

const KEYWORD_SEEDS: SeedRule[] = [
  { keywords: ['earbud', 'earphone', 'headphone', 'headset'], seedPrefix: 'audio' },
  { keywords: ['watch', 'tracker band', 'fitness tracker'], seedPrefix: 'watch' },
  { keywords: ['webcam', 'camera'], seedPrefix: 'camera' },
  { keywords: ['speaker', 'soundbar'], seedPrefix: 'speaker' },
  { keywords: ['keyboard', 'keypad'], seedPrefix: 'keyboard' },
  { keywords: ['ssd', 'storage', 'hard drive', 'usb', 'hub', 'charger', 'cable'], seedPrefix: 'tech-accessory' },
  { keywords: ['tablet', 'ipad', 'laptop', 'computer', 'monitor'], seedPrefix: 'computer' },
  { keywords: ['shirt', 'oxford', 'tee', 'top', 'blouse', 'hoodie', 'sweater', 'dress', 'jacket', 'coat', 'scarf'], seedPrefix: 'apparel' },
  { keywords: ['jean', 'denim', 'pant', 'shorts', 'trouser'], seedPrefix: 'denim' },
  { keywords: ['belt', 'leather'], seedPrefix: 'leather' },
  { keywords: ['pillow', 'blanket', 'bedding', 'mattress'], seedPrefix: 'bedding' },
  { keywords: ['lamp', 'light', 'lighting'], seedPrefix: 'lighting' },
  { keywords: ['cookware', 'knife', 'kitchen', 'pan', 'pot'], seedPrefix: 'kitchen' },
  { keywords: ['planter', 'garden', 'plant', 'ceramic pot'], seedPrefix: 'garden' },
  { keywords: ['candle', 'scent'], seedPrefix: 'candle' },
  { keywords: ['clock', 'wall decor', 'basket', 'storage'], seedPrefix: 'home-decor' },
  { keywords: ['yoga', 'mat'], seedPrefix: 'yoga' },
  { keywords: ['dumbbell', 'weight', 'resistance band', 'fitness'], seedPrefix: 'fitness' },
  { keywords: ['tent', 'camping', 'hiking', 'backpack'], seedPrefix: 'outdoor' },
  { keywords: ['helmet', 'cycling', 'bike'], seedPrefix: 'cycling' },
  { keywords: ['tennis', 'racket', 'soccer', 'ball'], seedPrefix: 'sports-ball' },
  { keywords: ['goggle', 'swim'], seedPrefix: 'swim' },
  { keywords: ['serum', 'moisturizer', 'cream', 'skincare', 'face', 'anti-aging', 'cleansing brush'], seedPrefix: 'skincare' },
  { keywords: ['lipstick', 'makeup', 'eyeshadow', 'palette', 'cosmetic'], seedPrefix: 'makeup' },
  { keywords: ['shampoo', 'lotion', 'sunscreen', 'perfume'], seedPrefix: 'beauty-care' },
  { keywords: ['book', 'novel', 'thriller', 'fiction', 'poetry', 'biography', 'guide', 'cookbook', 'graphic novel'], seedPrefix: 'books' },
  { keywords: ['board game', 'puzzle', 'blocks', 'toy', 'teddy', 'plush', 'doll', 'action figure', 'rc car', 'bubble'], seedPrefix: 'toys' },
  { keywords: ['art supplies', 'science experiment'], seedPrefix: 'kids-craft' },
  {
    keywords: ['floor mat', 'seat cover', 'car vacuum', 'headlight', 'tire', 'windshield', 'cargo', 'phone mount', 'jump starter', 'air freshener', 'automotive'],
    seedPrefix: 'automotive',
  },
  { keywords: ['vitamin', 'supplement', 'protein', 'omega', 'probiotic', 'collagen', 'melatonin', 'superfood', 'electrolyte', 'capsule', 'tablet', 'powder'], seedPrefix: 'supplements' },
  { keywords: ['foam roller', 'loop band', 'recovery'], seedPrefix: 'recovery' },
  { keywords: ['coffee', 'tea', 'olive oil', 'chocolate', 'granola', 'pasta', 'honey', 'nut butter', 'snack', 'spice', 'gourmet', 'organic', 'food', 'beverage'], seedPrefix: 'food' },
];

/** Stable, product-relevant image URL from name + category. */
export function resolveProductImageUrl(
  productName: string,
  categorySlug: string,
  uniqueKey: string,
): string {
  const lower = productName.toLowerCase();

  for (const rule of KEYWORD_SEEDS) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return imageUrl(`${rule.seedPrefix}-${uniqueKey}`);
    }
  }

  return imageUrl(`${categorySlug}-${uniqueKey}`);
}
