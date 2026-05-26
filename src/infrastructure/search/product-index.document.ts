export interface ProductIndexDocument {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  imageUrl: string;
  popularityScore: number;
  createdAt: string;
  attributes: { name: string; value: string }[];
}
