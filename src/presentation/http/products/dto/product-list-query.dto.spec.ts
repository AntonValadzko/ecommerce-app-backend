import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductListQueryDto } from './product-list-query.dto';

describe('ProductListQueryDto', () => {
  it('transforms query string values and maps to ProductQuery', () => {
    const dto = plainToInstance(ProductListQueryDto, {
      q: 'phone',
      categoryId: '2',
      category: 'phones',
      brand: 'Apple',
      minPrice: '10.5',
      maxPrice: '99',
      minRating: '4',
      inStock: 'true',
      sort: 'price_asc',
      page: '2',
      limit: '48',
      attributes: '{"Color":["Black"]}',
    });

    expect(dto.toProductQuery()).toEqual({
      search: 'phone',
      categoryId: 2,
      categorySlug: 'phones',
      brand: ['Apple'],
      minPrice: 10.5,
      maxPrice: 99,
      minRating: 4,
      inStock: true,
      attributes: { Color: ['Black'] },
      sort: 'price_asc',
      page: 2,
      limit: 48,
      cursor: undefined,
    });
  });

  it('ignores invalid attributes json', () => {
    const dto = plainToInstance(ProductListQueryDto, { attributes: '{bad json' });

    expect(dto.attributes).toBeUndefined();
  });

  it('validates allowed limit values', async () => {
    const dto = plainToInstance(ProductListQueryDto, { limit: '10' });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });
});
