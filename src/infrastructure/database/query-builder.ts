import type { ProductQuery, SortOption } from '../../domain/entities/product.js';

export interface SqlFragment {
  where: string;
  params: Record<string, unknown>;
  joins: string;
  orderBy: string;
  ftsJoin?: string;
}

export function buildProductQuery(query: ProductQuery): SqlFragment {
  const conditions: string[] = ['1=1'];
  const params: Record<string, unknown> = {};
  let joins = '';
  let ftsJoin = '';

  if (query.search?.trim()) {
    const tokens = query.search
      .trim()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.length > 0) {
      ftsJoin = `
        INNER JOIN products_fts fts ON fts.rowid = p.id
        AND products_fts MATCH @ftsTerm
      `;
      params.ftsTerm = tokens.map((t) => `${t}*`).join(' ');
    }
  }

  if (query.categoryId) {
    conditions.push('p.category_id = @categoryId');
    params.categoryId = query.categoryId;
  }

  if (query.categorySlug) {
    conditions.push('c.slug = @categorySlug');
    params.categorySlug = query.categorySlug;
  }

  if (query.brand?.length) {
    const placeholders = query.brand.map((_, i) => `@brand${i}`);
    query.brand.forEach((b, i) => {
      params[`brand${i}`] = b;
    });
    conditions.push(`p.brand IN (${placeholders.join(', ')})`);
  }

  if (query.minPrice !== undefined) {
    conditions.push('p.price >= @minPrice');
    params.minPrice = query.minPrice;
  }

  if (query.maxPrice !== undefined) {
    conditions.push('p.price <= @maxPrice');
    params.maxPrice = query.maxPrice;
  }

  if (query.minRating !== undefined) {
    conditions.push('p.rating >= @minRating');
    params.minRating = query.minRating;
  }

  if (query.inStock === true) {
    conditions.push('p.in_stock = 1');
  }

  if (query.attributes && Object.keys(query.attributes).length > 0) {
    let attrIndex = 0;
    for (const [name, values] of Object.entries(query.attributes)) {
      if (!values.length) continue;
      const alias = `pa${attrIndex}`;
      joins += ` INNER JOIN product_attributes ${alias} ON ${alias}.product_id = p.id AND ${alias}.name = @attrName${attrIndex}`;
      params[`attrName${attrIndex}`] = name;
      const valuePlaceholders = values.map((_, vi) => {
        const key = `attrVal${attrIndex}_${vi}`;
        params[key] = values[vi];
        return `@${key}`;
      });
      conditions.push(`${alias}.value IN (${valuePlaceholders.join(', ')})`);
      attrIndex++;
    }
  }

  const orderBy = buildOrderBy(query.sort, !!query.search?.trim());

  return {
    where: conditions.join(' AND '),
    params,
    joins,
    orderBy,
    ftsJoin,
  };
}

function buildOrderBy(sort: SortOption | undefined, hasSearch: boolean): string {
  switch (sort) {
    case 'price_asc':
      return 'ORDER BY p.price ASC, p.id ASC';
    case 'price_desc':
      return 'ORDER BY p.price DESC, p.id DESC';
    case 'rating':
      return 'ORDER BY p.rating DESC, p.review_count DESC, p.id DESC';
    case 'popularity':
      return 'ORDER BY p.popularity_score DESC, p.id DESC';
    case 'newest':
      return 'ORDER BY p.created_at DESC, p.id DESC';
    case 'relevance':
    default:
      if (hasSearch) {
        return 'ORDER BY rank ASC, p.popularity_score DESC';
      }
      return 'ORDER BY p.popularity_score DESC, p.id DESC';
  }
}

export function getSelectColumns(hasFts: boolean): string {
  const rankCol = hasFts ? ', rank' : '';
  return `
    p.id, p.sku, p.name, p.slug, p.brand, p.category_id as categoryId,
    c.name as categoryName, c.slug as categorySlug,
    p.price, p.compare_at_price as compareAtPrice, p.currency,
    p.rating, p.review_count as reviewCount, p.in_stock as inStock,
    p.image_url as imageUrl, p.popularity_score as popularityScore
    ${rankCol}
  `;
}
