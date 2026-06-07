import { createCategoryEntity, createProductEntity, createSavedSearchEntity } from '../../test/fixtures';
import { toCategory } from './category.mapper';
import { toProduct, toProductListItem, toQuickViewProduct } from './product.mapper';
import { toSavedSearch, toSavedSearchEntity } from './saved-search.mapper';

describe('category.mapper', () => {
  it('maps entity fields', () => {
    const entity = createCategoryEntity({ id: 2, productCount: 5 });

    expect(toCategory(entity)).toEqual({
      id: 2,
      slug: 'electronics',
      name: 'Electronics',
      parentId: null,
      description: 'Gadgets',
      productCount: 5,
    });
  });
});

describe('product.mapper', () => {
  it('maps full product with nested category and attributes', () => {
    const entity = createProductEntity();

    expect(toProduct(entity)).toMatchObject({
      id: 1,
      sku: 'SKU-001',
      categoryName: 'Electronics',
      price: 99.99,
      attributes: [{ name: 'Color', value: 'Red' }],
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('maps list item with empty category fallbacks', () => {
    const entity = createProductEntity({ category: undefined });

    expect(toProductListItem(entity)).toMatchObject({
      categoryName: '',
      categorySlug: '',
    });
  });

  it('maps quick view product', () => {
    const entity = createProductEntity();

    expect(toQuickViewProduct(entity)).toMatchObject({
      id: 1,
      name: 'Test Product',
      attributes: [{ name: 'Color', value: 'Red' }],
    });
  });
});

describe('saved-search.mapper', () => {
  it('maps entity to domain model', () => {
    const entity = createSavedSearchEntity();

    expect(toSavedSearch(entity)).toEqual({
      id: 'search-1',
      sessionId: 'session-1',
      name: 'My search',
      query: { search: 'phone', page: 1, limit: 24 },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    });
  });

  it('maps domain data to entity', () => {
    const entity = toSavedSearchEntity({
      id: 'x',
      sessionId: 's',
      name: 'n',
      query: { search: 'a' },
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    });

    expect(entity.queryJson).toEqual({ search: 'a' });
  });
});
