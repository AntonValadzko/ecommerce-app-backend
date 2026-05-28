import type { ProductAttribute } from './product.model';

/** Fields for create; slug resolved in application layer when omitted. */
export type CreateProductCommand = Omit<CreateProductInput, 'slug'> & { slug?: string };

export interface CreateProductInput {
  sku: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: number;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  popularityScore: number;
  imageUrl: string;
  attributes: ProductAttribute[];
}

export interface UpdateProductInput {
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  brand?: string;
  categoryId?: number;
  price?: number;
  compareAtPrice?: number | null;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  stockQuantity?: number;
  popularityScore?: number;
  imageUrl?: string;
  attributes?: ProductAttribute[];
}
