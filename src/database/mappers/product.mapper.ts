import { ProductEntity } from '../entities/product.entity';
import type { Product, ProductListItem, QuickViewProduct } from '../../domain/products/product.model';
import { toNumber, toOptionalNumber } from './numeric';

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

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
    price: toNumber(entity.price),
    compareAtPrice: toOptionalNumber(entity.compareAtPrice),
    currency: entity.currency,
    rating: toNumber(entity.rating),
    reviewCount: Number(entity.reviewCount),
    inStock: entity.inStock,
    stockQuantity: Number(entity.stockQuantity),
    popularityScore: Number(entity.popularityScore),
    imageUrl: entity.imageUrl,
    attributes: (entity.attributes ?? []).map((a) => ({ name: a.name, value: a.value })),
    createdAt: toIsoString(entity.createdAt),
    updatedAt: toIsoString(entity.updatedAt),
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
    price: toNumber(entity.price),
    compareAtPrice: toOptionalNumber(entity.compareAtPrice),
    currency: entity.currency,
    rating: toNumber(entity.rating),
    reviewCount: Number(entity.reviewCount),
    inStock: entity.inStock,
    imageUrl: entity.imageUrl,
    popularityScore: Number(entity.popularityScore),
  };
}

export function toQuickViewProduct(entity: ProductEntity): QuickViewProduct {
  return {
    id: entity.id,
    sku: entity.sku,
    name: entity.name,
    slug: entity.slug,
    brand: entity.brand,
    price: toNumber(entity.price),
    compareAtPrice: toOptionalNumber(entity.compareAtPrice),
    currency: entity.currency,
    rating: toNumber(entity.rating),
    reviewCount: Number(entity.reviewCount),
    inStock: entity.inStock,
    imageUrl: entity.imageUrl,
    attributes: (entity.attributes ?? []).map((a) => ({ name: a.name, value: a.value })),
  };
}
