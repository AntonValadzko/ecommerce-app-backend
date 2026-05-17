import type Database from 'better-sqlite3';
import type {
  AutocompleteSuggestion,
  FilterFacets,
  IProductRepository,
} from '../../domain/repositories/product.repository.js';
import type {
  PaginatedResult,
  Product,
  ProductAttribute,
  ProductListItem,
  ProductQuery,
} from '../../domain/entities/product.js';
import { buildProductQuery, getSelectColumns } from '../database/query-builder.js';

interface ProductRow {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  brand: string;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: number;
  stockQuantity?: number;
  popularityScore: number;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export class SqliteProductRepository implements IProductRepository {
  constructor(private readonly db: Database.Database) {}

  async findById(id: number): Promise<Product | null> {
    const row = this.db
      .prepare(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         JOIN categories c ON c.id = p.category_id
         WHERE p.id = ?`
      )
      .get(id) as Record<string, unknown> | undefined;

    if (!row) return null;
    return this.mapToProduct(row);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const row = this.db
      .prepare(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         JOIN categories c ON c.id = p.category_id
         WHERE p.slug = ?`
      )
      .get(slug) as Record<string, unknown> | undefined;

    if (!row) return null;
    return this.mapToProduct(row);
  }

  async findMany(query: ProductQuery): Promise<PaginatedResult<ProductListItem>> {
    const { where, params, joins, orderBy, ftsJoin } = buildProductQuery(query);
    const hasFts = !!ftsJoin;
    const limit = query.limit ?? 24;
    const page = query.page ?? 1;
    const offset = query.cursor ? this.decodeCursor(query.cursor) : (page - 1) * limit;

    const baseJoins = `
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ${joins}
      ${ftsJoin ?? ''}
    `;

    const countSql = `SELECT COUNT(DISTINCT p.id) as total ${baseJoins} WHERE ${where}`;
    const total = (this.db.prepare(countSql).get(params) as { total: number }).total;

    const rankSelect = hasFts ? ', bm25(products_fts) as rank' : '';
    const selectSql = `
      SELECT DISTINCT ${getSelectColumns(hasFts)} ${rankSelect}
      ${baseJoins}
      WHERE ${where}
      ${orderBy.replace('rank', 'bm25(products_fts)')}
      LIMIT @limit OFFSET @offset
    `;

    const rows = this.db.prepare(selectSql).all({
      ...params,
      limit: limit + 1,
      offset,
    }) as ProductRow[];

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((r) => this.mapToListItem(r));
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

  async autocomplete(term: string, limit: number): Promise<AutocompleteSuggestion[]> {
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
         LIMIT @limit`
      )
      .all({ term: ftsTerm, limit }) as { id: number; name: string; slug: string }[];

    for (const p of products) {
      suggestions.push({
        type: 'product',
        id: p.id,
        label: p.name,
        slug: p.slug,
      });
    }

    const brands = this.db
      .prepare(
        `SELECT DISTINCT brand FROM products
         WHERE brand LIKE @pattern
         LIMIT @limit`
      )
      .all({ pattern: `%${trimmed}%`, limit: Math.max(0, limit - suggestions.length) }) as {
      brand: string;
    }[];

    for (const b of brands) {
      if (!suggestions.some((s) => s.type === 'brand' && s.label === b.brand)) {
        suggestions.push({ type: 'brand', id: b.brand, label: b.brand });
      }
    }

    return suggestions.slice(0, limit);
  }

  async getFacets(query: ProductQuery): Promise<FilterFacets> {
    const { where, params, joins, ftsJoin } = buildProductQuery({
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
      ${ftsJoin ?? ''}
    `;

    const brands = this.db
      .prepare(
        `SELECT p.brand as name, COUNT(DISTINCT p.id) as count
         ${baseJoins}
         WHERE ${where}
         GROUP BY p.brand
         ORDER BY count DESC, p.brand ASC
         LIMIT 50`
      )
      .all(params) as { name: string; count: number }[];

    const priceRange = this.db
      .prepare(
        `SELECT MIN(p.price) as min, MAX(p.price) as max
         ${baseJoins}
         WHERE ${where}`
      )
      .get(params) as { min: number; max: number };

    const ratingThresholds = [4, 3, 2, 1];
    const ratings = ratingThresholds.map((threshold) => {
      const result = this.db
        .prepare(
          `SELECT COUNT(DISTINCT p.id) as count
           ${baseJoins}
           WHERE ${where} AND p.rating >= @threshold`
        )
        .get({ ...params, threshold }) as { count: number };
      return { threshold, count: result.count };
    });

    const categories = this.db
      .prepare(
        `SELECT c.id, c.name, c.slug, COUNT(DISTINCT p.id) as count
         ${baseJoins}
         WHERE ${where}
         GROUP BY c.id, c.name, c.slug
         ORDER BY count DESC`
      )
      .all(params) as { id: number; name: string; slug: string; count: number }[];

    const attrRows = this.db
      .prepare(
        `SELECT pa.name, pa.value, COUNT(DISTINCT p.id) as count
         ${baseJoins}
         INNER JOIN product_attributes pa ON pa.product_id = p.id
         WHERE ${where}
         GROUP BY pa.name, pa.value
         ORDER BY pa.name, count DESC`
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

  async findRelated(productId: number, limit: number): Promise<ProductListItem[]> {
    const product = await this.findById(productId);
    if (!product) return [];

    const rows = this.db
      .prepare(
        `SELECT p.id, p.sku, p.name, p.slug, p.brand, p.category_id as categoryId,
                c.name as categoryName, c.slug as categorySlug,
                p.price, p.compare_at_price as compareAtPrice, p.currency,
                p.rating, p.review_count as reviewCount, p.in_stock as inStock,
                p.image_url as imageUrl, p.popularity_score as popularityScore
         FROM products p
         JOIN categories c ON c.id = p.category_id
         WHERE p.category_id = @categoryId AND p.id != @productId
         ORDER BY p.popularity_score DESC
         LIMIT @limit`
      )
      .all({ categoryId: product.categoryId, productId, limit }) as ProductRow[];

    return rows.map((r) => this.mapToListItem(r));
  }

  private mapToProduct(row: Record<string, unknown>): Product {
    const attrs = this.db
      .prepare('SELECT name, value FROM product_attributes WHERE product_id = ?')
      .all(row.id) as ProductAttribute[];

    return {
      id: row.id as number,
      sku: row.sku as string,
      name: row.name as string,
      slug: row.slug as string,
      description: row.description as string,
      brand: row.brand as string,
      categoryId: row.category_id as number,
      categoryName: row.category_name as string,
      categorySlug: row.category_slug as string,
      price: row.price as number,
      compareAtPrice: (row.compare_at_price as number | null) ?? null,
      currency: row.currency as string,
      rating: row.rating as number,
      reviewCount: row.review_count as number,
      inStock: Boolean(row.in_stock),
      stockQuantity: row.stock_quantity as number,
      popularityScore: row.popularity_score as number,
      imageUrl: row.image_url as string,
      attributes: attrs,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapToListItem(row: ProductRow): ProductListItem {
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
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString()) as {
      offset: number;
    };
    return parsed.offset;
  }
}
