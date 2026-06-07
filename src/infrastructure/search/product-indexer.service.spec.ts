import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductIndexerService } from './product-indexer.service';
import { ProductEntity } from '../../database/entities/product.entity';
import { OpenSearchClientProvider } from './opensearch.client';
import { createProductEntity } from '../../test/fixtures';
import { EntityNotFoundError } from '../../domain/common/entity-not-found.error';

describe('ProductIndexerService', () => {
  let service: ProductIndexerService;
  const productRepo = {
    findOne: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
  };
  const os = {
    index: 'products',
    client: {
      index: jest.fn(),
      bulk: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductIndexerService,
        { provide: OpenSearchClientProvider, useValue: os },
        { provide: getRepositoryToken(ProductEntity), useValue: productRepo },
      ],
    }).compile();

    service = module.get(ProductIndexerService);
  });

  it('maps product entity to index document', () => {
    const entity = createProductEntity();

    expect(service.toIndexDocument(entity)).toEqual({
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
      imageUrl: 'https://example.com/img.jpg',
      popularityScore: 100,
      createdAt: '2024-01-01T00:00:00.000Z',
      attributes: [{ name: 'Color', value: 'Red' }],
    });
  });

  it('throws when indexing missing product', async () => {
    productRepo.findOne.mockResolvedValue(null);

    await expect(service.indexProduct(99)).rejects.toThrow(EntityNotFoundError);
  });
});
