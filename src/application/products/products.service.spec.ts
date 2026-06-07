import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { CATEGORY_REPOSITORY } from '../../domain/categories/category.repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/products/product.repository.port';
import { PRODUCT_SEARCH_REPOSITORY } from '../../domain/products/product-search.repository.port';
import { EntityNotFoundError } from '../../domain/common/entity-not-found.error';
import { createProduct } from '../../test/fixtures';
import type { CreateProductCommand } from '../../domain/products/product-write.model';

const createCommand = (overrides: Partial<CreateProductCommand> = {}): CreateProductCommand => ({
  sku: 'SKU-NEW',
  name: 'Phone',
  description: 'desc',
  brand: 'Acme',
  categoryId: 1,
  price: 10,
  compareAtPrice: null,
  currency: 'USD',
  rating: 0,
  reviewCount: 0,
  inStock: true,
  stockQuantity: 1,
  popularityScore: 0,
  imageUrl: 'https://example.com/img.jpg',
  attributes: [],
  ...overrides,
});

describe('ProductsService', () => {
  let service: ProductsService;
  const productRepo = {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findQuickView: jest.fn(),
    findRelated: jest.fn(),
    existsBySku: jest.fn(),
    existsBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const productSearch = {
    findMany: jest.fn(),
    autocomplete: jest.fn(),
    getFacets: jest.fn(),
  };
  const categoryRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PRODUCT_REPOSITORY, useValue: productRepo },
        { provide: PRODUCT_SEARCH_REPOSITORY, useValue: productSearch },
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepo },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                defaultPageSize: 24,
                allowedPageSizes: [24, 48, 96],
                maxPageSize: 96,
                autocompleteLimit: 10,
                relatedProductsLimit: 6,
              })[key as 'defaultPageSize'],
          },
        },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('throws when product is missing', async () => {
    productRepo.findById.mockResolvedValue(null);

    await expect(service.getProduct(1)).rejects.toThrow(EntityNotFoundError);
  });

  it('returns product when found', async () => {
    const product = createProduct();
    productRepo.findById.mockResolvedValue(product);

    await expect(service.getProduct(1)).resolves.toEqual(product);
  });

  it('normalizes list limit to allowed page sizes', async () => {
    productSearch.findMany.mockResolvedValue({ items: [], total: 0, page: 1, limit: 48, totalPages: 0, hasMore: false });

    await service.listProducts({ limit: 48 });

    expect(productSearch.findMany).toHaveBeenCalledWith(expect.objectContaining({ limit: 48 }));
  });

  it('caps unknown list limit at max page size', async () => {
    productSearch.findMany.mockResolvedValue({ items: [], total: 0, page: 1, limit: 96, totalPages: 0, hasMore: false });

    await service.listProducts({ limit: 500 });

    expect(productSearch.findMany).toHaveBeenCalledWith(expect.objectContaining({ limit: 96 }));
  });

  it('creates product with unique slug suffix', async () => {
    categoryRepo.findById.mockResolvedValue({ id: 1 });
    productRepo.existsBySku.mockResolvedValue(false);
    productRepo.existsBySlug.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    productRepo.create.mockResolvedValue(createProduct({ slug: 'phone-2' }));

    await service.createProduct(createCommand());

    expect(productRepo.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'phone-2' }));
  });

  it('throws conflict for duplicate sku on create', async () => {
    categoryRepo.findById.mockResolvedValue({ id: 1 });
    productRepo.existsBySku.mockResolvedValue(true);

    await expect(service.createProduct(createCommand({ sku: 'SKU-001' }))).rejects.toThrow(
      ConflictException,
    );
  });

  it('returns existing product when update patch is empty', async () => {
    const product = createProduct();
    productRepo.findById.mockResolvedValue(product);

    await expect(service.updateProduct(1, {})).resolves.toEqual(product);
    expect(productRepo.update).not.toHaveBeenCalled();
  });

  it('delegates autocomplete and facets', async () => {
    productSearch.autocomplete.mockResolvedValue([]);
    productSearch.getFacets.mockResolvedValue({ brands: [] });

    await service.autocomplete('pho', 5);
    await service.getFacets({ search: 'phone' });

    expect(productSearch.autocomplete).toHaveBeenCalledWith('pho', 5);
    expect(productSearch.getFacets).toHaveBeenCalledWith({ search: 'phone' });
  });

  it('throws when slug product is missing', async () => {
    productRepo.findBySlug.mockResolvedValue(null);

    await expect(service.getProductBySlug('missing')).rejects.toThrow(EntityNotFoundError);
  });

  it('slugifies and validates slug on update', async () => {
    productRepo.findById.mockResolvedValue(createProduct());
    productRepo.existsBySlug.mockResolvedValue(false);
    productRepo.update.mockResolvedValue(createProduct({ slug: 'new-slug' }));

    await service.updateProduct(1, { slug: 'New Slug!!!' });

    expect(productRepo.update).toHaveBeenCalledWith(1, { slug: 'new-slug' });
  });
});
