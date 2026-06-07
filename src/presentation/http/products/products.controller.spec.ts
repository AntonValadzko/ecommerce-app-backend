import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../../../application/products/products.service';
import { ProductsPresenter } from './products.presenter';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { AutocompleteQueryDto } from './dto/autocomplete-query.dto';
import { createProduct } from '../../../test/fixtures';

describe('ProductsController', () => {
  let controller: ProductsController;
  const productsService = {
    listProducts: jest.fn(),
    getFacets: jest.fn(),
    autocomplete: jest.fn(),
    getProduct: jest.fn(),
    getProductBySlug: jest.fn(),
    getQuickView: jest.fn(),
    getRelatedProducts: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
  };

  const req = {
    protocol: 'http',
    get: (name: string) => (name === 'host' ? 'localhost:3000' : undefined),
  } as never;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsPresenter,
        { provide: ProductsService, useValue: productsService },
        { provide: ConfigService, useValue: { get: () => [24, 48, 96] } },
      ],
    }).compile();

    controller = module.get(ProductsController);
  });

  it('lists products with presenter envelope', async () => {
    const dto = new ProductListQueryDto();
    dto.q = 'phone';
    productsService.listProducts.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 24,
      totalPages: 0,
      hasMore: false,
      nextCursor: null,
    });

    const response = await controller.findAll(dto, req);

    expect(response.data).toEqual([]);
    expect(response.meta.seo.canonicalUrl).toBe('http://localhost:3000/products');
  });

  it('returns facets', async () => {
    const dto = new ProductListQueryDto();
    productsService.getFacets.mockResolvedValue({ brands: [] });

    await expect(controller.getFacets(dto)).resolves.toEqual({ data: { brands: [] } });
  });

  it('returns autocomplete suggestions', async () => {
    const dto = new AutocompleteQueryDto();
    dto.q = 'pho';
    productsService.autocomplete.mockResolvedValue([{ text: 'phone', type: 'product' }]);

    await expect(controller.autocomplete(dto)).resolves.toEqual({
      data: [{ text: 'phone', type: 'product' }],
    });
  });

  it('returns product by id', async () => {
    const product = createProduct();
    productsService.getProduct.mockResolvedValue(product);

    const response = await controller.findOne(1, req);

    expect(response.data).toEqual(product);
    expect(response.meta.seo.canonicalUrl).toContain('/products/test-product');
  });

  it('returns related products', async () => {
    productsService.getRelatedProducts.mockResolvedValue([{ id: 2 }]);

    await expect(controller.getRelated(1)).resolves.toEqual({ data: [{ id: 2 }] });
  });
});
