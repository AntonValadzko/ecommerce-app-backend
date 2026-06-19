import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProductEntity } from '../../../database/entities/product.entity';
import { CategoryEntity } from '../../../database/entities/category.entity';
import { toProductListItem } from '../../../database/mappers/product.mapper';
import type { IProductSearchRepository } from '../../../domain/products/product-search.repository.port';
import type {
  AutocompleteSuggestion,
  FilterFacets,
  PaginatedResult,
  ProductListItem,
  ProductQuery,
} from '../../../domain/products/product.model';
import { applyProductSearchFilters, applyProductSearchSort } from '../product-search-filters';

@Injectable()
export class PostgresProductSearchRepository implements IProductSearchRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  async findMany(query: ProductQuery): Promise<PaginatedResult<ProductListItem>> {
    const limit = query.limit ?? 24;
    const page = query.page ?? 1;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    applyProductSearchFilters(qb, query);
    applyProductSearchSort(qb, query);

    const total = await qb.clone().getCount();
    const entities = await qb
      .skip((page - 1) * limit)
      .take(limit + 1)
      .getMany();

    const hasMore = entities.length > limit;
    const items = entities.slice(0, limit).map(toProductListItem);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
      hasMore,
      nextCursor: null,
    };
  }

  async getFacets(query: ProductQuery): Promise<FilterFacets> {
    const [brands, categories, priceRange, ratings, attributes] = await Promise.all([
      this.aggregateBrands(query),
      this.aggregateCategories(query),
      this.aggregatePriceRange(query),
      this.aggregateRatings(query),
      this.aggregateAttributes(query),
    ]);

    return { brands, priceRange, ratings, categories, attributes };
  }

  async autocomplete(term: string, limit: number): Promise<AutocompleteSuggestion[]> {
    const trimmed = term.trim();
    if (!trimmed) return [];

    const pattern = `%${trimmed}%`;
    const products = await this.productRepo.find({
      where: [
        { name: ILike(pattern) },
        { sku: ILike(pattern) },
        { brand: ILike(pattern) },
      ],
      order: { popularityScore: 'DESC', id: 'DESC' },
      take: limit,
    });

    const suggestions: AutocompleteSuggestion[] = products.map((p) => ({
      type: 'product',
      id: p.id,
      label: p.name,
      slug: p.slug,
    }));

    if (suggestions.length < limit) {
      const brandRows = await this.productRepo
        .createQueryBuilder('product')
        .select('DISTINCT product.brand', 'brand')
        .where('product.brand ILIKE :pattern', { pattern })
        .orderBy('product.brand', 'ASC')
        .limit(limit - suggestions.length)
        .getRawMany<{ brand: string }>();

      for (const row of brandRows) {
        if (!suggestions.some((s) => s.type === 'brand' && s.label === row.brand)) {
          suggestions.push({ type: 'brand', id: row.brand, label: row.brand });
        }
      }
    }

    return suggestions.slice(0, limit);
  }

  private createFacetQueryBuilder(query: ProductQuery, exclude: Parameters<typeof applyProductSearchFilters>[2]) {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category');
    applyProductSearchFilters(qb, query, exclude);
    return qb;
  }

  private async aggregateBrands(query: ProductQuery) {
    const rows = await this.createFacetQueryBuilder(query, { brand: true })
      .select('product.brand', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.brand')
      .orderBy('count', 'DESC')
      .limit(50)
      .getRawMany<{ name: string; count: string }>();

    return rows.map((r) => ({ name: r.name, count: Number(r.count) }));
  }

  private async aggregateCategories(query: ProductQuery) {
    const rows = await this.createFacetQueryBuilder(query, { category: true })
      .select('category.id', 'id')
      .addSelect('category.name', 'name')
      .addSelect('category.slug', 'slug')
      .addSelect('COUNT(*)', 'count')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.slug')
      .orderBy('count', 'DESC')
      .limit(50)
      .getRawMany<{ id: string; name: string; slug: string; count: string }>();

    return rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      slug: r.slug,
      count: Number(r.count),
    }));
  }

  private async aggregatePriceRange(query: ProductQuery) {
    const row = await this.createFacetQueryBuilder(query, { price: true })
      .select('MIN(product.price)', 'min')
      .addSelect('MAX(product.price)', 'max')
      .getRawOne<{ min: string | null; max: string | null }>();

    return {
      min: Number(row?.min ?? 0),
      max: Number(row?.max ?? 0),
    };
  }

  private async aggregateRatings(query: ProductQuery) {
    const row = await this.createFacetQueryBuilder(query, { rating: true })
      .select('COUNT(*) FILTER (WHERE product.rating >= 4)', 'rating4')
      .addSelect('COUNT(*) FILTER (WHERE product.rating >= 3)', 'rating3')
      .addSelect('COUNT(*) FILTER (WHERE product.rating >= 2)', 'rating2')
      .addSelect('COUNT(*) FILTER (WHERE product.rating >= 1)', 'rating1')
      .getRawOne<{ rating4: string; rating3: string; rating2: string; rating1: string }>();

    return [
      { threshold: 4, count: Number(row?.rating4 ?? 0) },
      { threshold: 3, count: Number(row?.rating3 ?? 0) },
      { threshold: 2, count: Number(row?.rating2 ?? 0) },
      { threshold: 1, count: Number(row?.rating1 ?? 0) },
    ];
  }

  private async aggregateAttributes(query: ProductQuery) {
    const subQb = this.createFacetQueryBuilder(query, { attributes: true }).select('product.id');
    const rows = await this.productRepo.manager
      .createQueryBuilder()
      .select('pa.name', 'name')
      .addSelect('pa.value', 'value')
      .addSelect('COUNT(*)', 'count')
      .from('product_attributes', 'pa')
      .where(`pa.product_id IN (${subQb.getQuery()})`)
      .setParameters(subQb.getParameters())
      .groupBy('pa.name')
      .addGroupBy('pa.value')
      .orderBy('count', 'DESC')
      .limit(500)
      .getRawMany<{ name: string; value: string; count: string }>();

    const attributes: Record<string, { value: string; count: number }[]> = {};
    for (const row of rows) {
      attributes[row.name] ??= [];
      const bucket = attributes[row.name]!;
      if (bucket.length < 30) {
        bucket.push({ value: row.value, count: Number(row.count) });
      }
    }
    return attributes;
  }
}
