import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SqliteBaseRepository } from '../../../database/sqlite-base.repository';
import type {
  ProductListItem,
  ProductQuery,
  PaginatedResult,
  AutocompleteSuggestion,
  FilterFacets,
  SortOption,
} from '../../../domain/products/product.model';

/**
 * Raw SQL access for FTS5 search, faceted counts, and dynamic filter joins.
 * Schema is defined by TypeORM entities; only queries that cannot be expressed
 * cleanly in the query builder live here.
 */
interface SqlFragment {
  where: string;
  params: Record<string, unknown>;
  joins: string;
  orderBy: string;
  ftsJoin: string;
}

interface ProductRow {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: number;
  imageUrl: string;
  popularityScore: number;
}

@Injectable()
export class ProductSearchRepository extends SqliteBaseRepository {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource);
  }

  findMany(query: ProductQuery): PaginatedResult<ProductListItem> {
    const { where, params, joins, orderBy, ftsJoin } = this.buildQuery(query);
    const hasFts = !!ftsJoin;
    const limit = query.limit ?? 24;
    const page = query.page ?? 1;
    const offset = query.cursor ? this.decodeCursor(query.cursor) : (page - 1) * limit;

    const baseJoins = `
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ${joins}
      ${ftsJoin}
    `;

    const countSql = `SELECT COUNT(DISTINCT p.id) as total ${baseJoins} WHERE ${where}`;
    const total = (this.db.prepare(countSql).get(params) as { total: number }).total;

    const rankSelect = hasFts ? ', bm25(products_fts) as rank' : '';
    const orderBySql = orderBy.replace('rank', 'bm25(products_fts)');
    const selectSql = `
      SELECT DISTINCT
        p.id, p.sku, p.name, p.slug, p.brand,
        p.category_id as categoryId,
        c.name as categoryName, c.slug as categorySlug,
        p.price, p.compare_at_price as compareAtPrice, p.currency,
        p.rating, p.review_count as reviewCount, p.in_stock as inStock,
        p.image_url as imageUrl, p.popularity_score as popularityScore
        ${rankSelect}
      ${baseJoins}
      WHERE ${where}
      ${orderBySql}
      LIMIT @limit OFFSET @offset
    `;

    const rows = this.db.prepare(selectSql).all({ ...params, limit: limit + 1, offset }) as ProductRow[];

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((r) => this.mapRowToListItem(r));
    const nextCursor = hasMore ? this.encodeCursor(offset + limit) : null;

    return {
      items,
      total,
      page: query.cursor ? Math.floor(offset / limit) + 1 : page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore,
      nextCursor,
    };
  }

  getFacets(query: ProductQuery): FilterFacets {
    const { where, params, joins, ftsJoin } = this.buildQuery({
      ...query,
      attributes: undefined,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
    });

    const baseJoins = `
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ${joins}
      ${ftsJoin}
    `;

    const brands = this.db
      .prepare(
        `SELECT p.brand as name, COUNT(DISTINCT p.id) as count
         ${baseJoins}
         WHERE ${where}
         GROUP BY p.brand
         ORDER BY count DESC, p.brand ASC
         LIMIT 50`,
      )
      .all(params) as { name: string; count: number }[];

    const priceRange = this.db
      .prepare(`SELECT MIN(p.price) as min, MAX(p.price) as max ${baseJoins} WHERE ${where}`)
      .get(params) as { min: number | null; max: number | null };

    const ratingCounts = this.db
      .prepare(
        `SELECT
           SUM(CASE WHEN p.rating >= 4 THEN 1 ELSE 0 END) as r4,
           SUM(CASE WHEN p.rating >= 3 THEN 1 ELSE 0 END) as r3,
           SUM(CASE WHEN p.rating >= 2 THEN 1 ELSE 0 END) as r2,
           SUM(CASE WHEN p.rating >= 1 THEN 1 ELSE 0 END) as r1
         ${baseJoins}
         WHERE ${where}`,
      )
      .get(params) as { r4: number; r3: number; r2: number; r1: number };

    const ratings = [
      { threshold: 4, count: ratingCounts.r4 },
      { threshold: 3, count: ratingCounts.r3 },
      { threshold: 2, count: ratingCounts.r2 },
      { threshold: 1, count: ratingCounts.r1 },
    ];

    const categories = this.db
      .prepare(
        `SELECT c.id, c.name, c.slug, COUNT(DISTINCT p.id) as count
         ${baseJoins}
         WHERE ${where}
         GROUP BY c.id, c.name, c.slug
         ORDER BY count DESC`,
      )
      .all(params) as { id: number; name: string; slug: string; count: number }[];

    const attrRows = this.db
      .prepare(
        `SELECT pa.name, pa.value, COUNT(DISTINCT p.id) as count
         ${baseJoins}
         INNER JOIN product_attributes pa ON pa.product_id = p.id
         WHERE ${where}
         GROUP BY pa.name, pa.value
         ORDER BY pa.name, count DESC`,
      )
      .all(params) as { name: string; value: string; count: number }[];

    const attributes: Record<string, { value: string; count: number }[]> = {};
    for (const row of attrRows) {
      if (!attributes[row.name]) attributes[row.name] = [];
      attributes[row.name]!.push({ value: row.value, count: row.count });
    }

    return {
      brands,
      priceRange: { min: priceRange.min ?? 0, max: priceRange.max ?? 0 },
      ratings,
      categories,
      attributes,
    };
  }

  autocomplete(term: string, limit: number): AutocompleteSuggestion[] {
    const trimmed = term.trim();
    if (!trimmed) return [];

    const ftsTerm = trimmed
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => `${t}*`)
      .join(' ');

    const suggestions: AutocompleteSuggestion[] = [];

    const products = this.db
      .prepare(
        `SELECT p.id, p.name, p.slug
         FROM products_fts fts
         JOIN products p ON p.id = fts.rowid
         WHERE products_fts MATCH @term
         ORDER BY bm25(products_fts)
         LIMIT @limit`,
      )
      .all({ term: ftsTerm, limit }) as { id: number; name: string; slug: string }[];

    for (const p of products) {
      suggestions.push({ type: 'product', id: p.id, label: p.name, slug: p.slug });
    }

    const brands = this.db
      .prepare(
        `SELECT DISTINCT brand FROM products
         WHERE brand LIKE @pattern
         LIMIT @limit`,
      )
      .all({
        pattern: `%${trimmed}%`,
        limit: Math.max(0, limit - suggestions.length),
      }) as { brand: string }[];

    for (const b of brands) {
      if (!suggestions.some((s) => s.type === 'brand' && s.label === b.brand)) {
        suggestions.push({ type: 'brand', id: b.brand, label: b.brand });
      }
    }

    return suggestions.slice(0, limit);
  }

  private buildQuery(query: ProductQuery): SqlFragment {
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
        ftsJoin = `INNER JOIN products_fts fts ON fts.rowid = p.id AND products_fts MATCH @ftsTerm`;
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

    return {
      where: conditions.join(' AND '),
      params,
      joins,
      orderBy: this.buildOrderBy(query.sort, !!query.search?.trim()),
      ftsJoin,
    };
  }

  private buildOrderBy(sort: SortOption | undefined, hasSearch: boolean): string {
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
        return hasSearch
          ? 'ORDER BY rank ASC, p.popularity_score DESC'
          : 'ORDER BY p.popularity_score DESC, p.id DESC';
    }
  }

  private mapRowToListItem(row: ProductRow): ProductListItem {
    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      slug: row.slug,
      brand: row.brand,
      categoryId: row.categoryId,
      categoryName: row.categoryName ?? '',
      categorySlug: row.categorySlug ?? '',
      price: row.price,
      compareAtPrice: row.compareAtPrice,
      currency: row.currency,
      rating: row.rating,
      reviewCount: row.reviewCount,
      inStock: Boolean(row.inStock),
      imageUrl: row.imageUrl,
      popularityScore: row.popularityScore,
    };
  }

  private encodeCursor(offset: number): string {
    return Buffer.from(JSON.stringify({ offset })).toString('base64url');
  }

  private decodeCursor(cursor: string): number {
    try {
      const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString()) as { offset: number };
      if (typeof parsed.offset !== 'number') throw new Error('missing offset');
      return parsed.offset;
    } catch {
      throw new BadRequestException('Invalid cursor value');
    }
  }
}
