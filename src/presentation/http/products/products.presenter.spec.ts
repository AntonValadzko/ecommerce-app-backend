import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsPresenter } from './products.presenter';
import { createProduct } from '../../../test/fixtures';

describe('ProductsPresenter', () => {
  let presenter: ProductsPresenter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsPresenter,
        {
          provide: ConfigService,
          useValue: { get: () => [24, 48, 96] },
        },
      ],
    }).compile();

    presenter = module.get(ProductsPresenter);
  });

  it('builds list response with pagination and seo meta', () => {
    const response = presenter.toListResponse(
      {
        items: [{ id: 1, name: 'Phone', slug: 'phone' } as never],
        total: 1,
        page: 1,
        limit: 24,
        totalPages: 1,
        hasMore: false,
        nextCursor: null,
      },
      { search: 'phone' },
      'relevance',
      true,
      'http://localhost:3000/api/v1',
    );

    expect(response.data).toHaveLength(1);
    expect(response.pagination.total).toBe(1);
    expect(response.meta.pageSizeOptions).toEqual([24, 48, 96]);
    expect(response.meta.seo.title).toContain('phone');
    expect(response.meta.seo.canonicalUrl).toBe('http://localhost:3000/api/v1/products');
  });

  it('builds product detail seo with schema.org data', () => {
    const response = presenter.toDetailResponse(createProduct(), 'http://localhost:3000/api/v1');

    expect(response.meta.seo.canonicalUrl).toBe('http://localhost:3000/api/v1/products/test-product');
    expect(response.meta.seo.structuredData).toMatchObject({
      '@type': 'Product',
      name: 'Test Product',
      offers: expect.objectContaining({
        availability: 'https://schema.org/InStock',
      }),
    });
  });

  it('wraps arbitrary data', () => {
    expect(presenter.toDataResponse([1, 2])).toEqual({ data: [1, 2] });
  });
});
