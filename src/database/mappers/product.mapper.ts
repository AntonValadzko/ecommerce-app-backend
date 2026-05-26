import { ProductEntity } from '../entities/product.entity';
import type { Product, ProductListItem, QuickViewProduct } from '../../domain/products/product.model';

export function toProduct(entity: ProductEntity): Product {
  return {
    id: entity.id,
    sku: entity.sku,
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    brand: entity.brand,
    categoryId: entity.categoryId,
    categoryName: entity.category?.name,
    categorySlug: entity.category?.slug,
    price: entity.price,
    compareAtPrice: entity.compareAtPrice,
    currency: entity.currency,
    rating: entity.rating,
    reviewCount: entity.reviewCount,
    inStock: entity.inStock,
    stockQuantity: entity.stockQuantity,
    popularityScore: entity.popularityScore,
    imageUrl: entity.imageUrl,
    attributes: (entity.attributes ?? []).map((a) => ({ name: a.name, value: a.value })),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export function toProductListItem(entity: ProductEntity): ProductListItem {
  return {
    id: entity.id,
    sku: entity.sku,
    name: entity.name,
    slug: entity.slug,
    brand: entity.brand,
    categoryId: entity.categoryId,
    categoryName: entity.category?.name ?? '',
    categorySlug: entity.category?.slug ?? '',
    price: entity.price,
    compareAtPrice: entity.compareAtPrice,
    currency: entity.currency,
    rating: entity.rating,
    reviewCount: entity.reviewCount,
    inStock: entity.inStock,
    imageUrl: entity.imageUrl,
    popularityScore: entity.popularityScore,
  };
}

export function toQuickViewProduct(entity: ProductEntity): QuickViewProduct {
  return {
    id: entity.id,
    sku: entity.sku,
    name: entity.name,
    slug: entity.slug,
    brand: entity.brand,
    price: entity.price,
    compareAtPrice: entity.compareAtPrice,
    currency: entity.currency,
    rating: entity.rating,
    reviewCount: entity.reviewCount,
    inStock: entity.inStock,
    imageUrl: entity.imageUrl,
    attributes: (entity.attributes ?? []).map((a) => ({ name: a.name, value: a.value })),
  };
}
