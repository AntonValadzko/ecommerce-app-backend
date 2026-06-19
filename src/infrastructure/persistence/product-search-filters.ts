import type { SelectQueryBuilder } from 'typeorm';
import type { ProductQuery } from '../../domain/products/product.model';
import type { FilterExclusions } from '../search/opensearch-query.builder';
import { ProductEntity } from '../../database/entities/product.entity';

export function applyProductSearchFilters(
  qb: SelectQueryBuilder<ProductEntity>,
  query: ProductQuery,
  exclude: FilterExclusions = {},
): void {
  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    qb.andWhere(
      '(product.name ILIKE :searchTerm OR product.description ILIKE :searchTerm OR product.sku ILIKE :searchTerm OR product.brand ILIKE :searchTerm)',
      { searchTerm: term },
    );
  }

  if (!exclude.category) {
    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: query.categoryId });
    }
    if (query.categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug: query.categorySlug });
    }
  }

  if (!exclude.brand && query.brand?.length) {
    qb.andWhere('product.brand IN (:...brands)', { brands: query.brand });
  }

  if (!exclude.price) {
    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }
  }

  if (!exclude.rating && query.minRating !== undefined) {
    qb.andWhere('product.rating >= :minRating', { minRating: query.minRating });
  }

  if (query.inStock === true) {
    qb.andWhere('product.inStock = true');
  }

  if (!exclude.attributes && query.attributes) {
    let index = 0;
    for (const [name, values] of Object.entries(query.attributes)) {
      if (!values.length) continue;
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM product_attributes pa${index}
          WHERE pa${index}.product_id = product.id
            AND pa${index}.name = :attrName${index}
            AND pa${index}.value IN (:...attrValues${index})
        )`,
        {
          [`attrName${index}`]: name,
          [`attrValues${index}`]: values,
        },
      );
      index++;
    }
  }
}

export function applyProductSearchSort(qb: SelectQueryBuilder<ProductEntity>, query: ProductQuery): void {
  const hasSearch = Boolean(query.search?.trim());
  const sort = query.sort ?? (hasSearch ? 'relevance' : 'popularity');

  switch (sort) {
    case 'price_asc':
      qb.orderBy('product.price', 'ASC').addOrderBy('product.id', 'ASC');
      break;
    case 'price_desc':
      qb.orderBy('product.price', 'DESC').addOrderBy('product.id', 'DESC');
      break;
    case 'rating':
      qb.orderBy('product.rating', 'DESC')
        .addOrderBy('product.reviewCount', 'DESC')
        .addOrderBy('product.id', 'DESC');
      break;
    case 'newest':
      qb.orderBy('product.createdAt', 'DESC').addOrderBy('product.id', 'DESC');
      break;
    case 'relevance':
      if (hasSearch) {
        const exact = `%${query.search!.trim()}%`;
        qb.addOrderBy(
          `CASE
            WHEN product.name ILIKE :relevanceExact THEN 0
            WHEN product.sku ILIKE :relevanceExact THEN 1
            WHEN product.brand ILIKE :relevanceExact THEN 2
            ELSE 3
          END`,
          'ASC',
        ).setParameter('relevanceExact', exact);
        qb.addOrderBy('product.popularityScore', 'DESC').addOrderBy('product.id', 'DESC');
      } else {
        qb.orderBy('product.popularityScore', 'DESC').addOrderBy('product.id', 'DESC');
      }
      break;
    case 'popularity':
    default:
      qb.orderBy('product.popularityScore', 'DESC').addOrderBy('product.id', 'DESC');
      break;
  }
}
