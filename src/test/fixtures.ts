import { CategoryEntity } from '../database/entities/category.entity';
import { ProductAttributeEntity } from '../database/entities/product-attribute.entity';
import { ProductEntity } from '../database/entities/product.entity';
import { SavedSearchEntity } from '../database/entities/saved-search.entity';
import type { Product } from '../domain/products/product.model';

export function createCategoryEntity(overrides: Partial<CategoryEntity> = {}): CategoryEntity {
  const entity = new CategoryEntity();
  entity.id = 1;
  entity.slug = 'electronics';
  entity.name = 'Electronics';
  entity.parentId = null;
  entity.description = 'Gadgets';
  entity.productCount = 10;
  Object.assign(entity, overrides);
  return entity;
}

export function createProductEntity(overrides: Partial<ProductEntity> = {}): ProductEntity {
  const category = createCategoryEntity();
  const entity = new ProductEntity();
  entity.id = 1;
  entity.sku = 'SKU-001';
  entity.name = 'Test Product';
  entity.slug = 'test-product';
  entity.description = 'A test product description';
  entity.brand = 'Acme';
  entity.categoryId = category.id;
  entity.category = category;
  entity.price = 99.99;
  entity.compareAtPrice = 129.99;
  entity.currency = 'USD';
  entity.rating = 4.5;
  entity.reviewCount = 12;
  entity.inStock = true;
  entity.stockQuantity = 5;
  entity.popularityScore = 100;
  entity.imageUrl = 'https://example.com/img.jpg';
  entity.createdAt = new Date('2024-01-01T00:00:00.000Z');
  entity.updatedAt = new Date('2024-01-02T00:00:00.000Z');
  entity.attributes = [
    Object.assign(new ProductAttributeEntity(), { id: 1, name: 'Color', value: 'Red', productId: 1 }),
  ];
  Object.assign(entity, overrides);
  return entity;
}

export function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    sku: 'SKU-001',
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product description',
    brand: 'Acme',
    categoryId: 1,
    categoryName: 'Electronics',
    categorySlug: 'electronics',
    price: 99.99,
    compareAtPrice: 129.99,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 12,
    inStock: true,
    stockQuantity: 5,
    popularityScore: 100,
    imageUrl: 'https://example.com/img.jpg',
    attributes: [{ name: 'Color', value: 'Red' }],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    ...overrides,
  };
}

export function createSavedSearchEntity(overrides: Partial<SavedSearchEntity> = {}): SavedSearchEntity {
  const entity = new SavedSearchEntity();
  entity.id = 'search-1';
  entity.sessionId = 'session-1';
  entity.name = 'My search';
  entity.queryJson = { search: 'phone', page: 1, limit: 24 };
  entity.createdAt = new Date('2024-01-01T00:00:00.000Z');
  entity.updatedAt = new Date('2024-01-02T00:00:00.000Z');
  Object.assign(entity, overrides);
  return entity;
}
