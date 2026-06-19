import { Injectable } from '@nestjs/common';
import type { IProductSearchRepository } from '../../domain/products/product-search.repository.port';
import type {
  AutocompleteSuggestion,
  FilterFacets,
  PaginatedResult,
  ProductListItem,
  ProductQuery,
  SortOption,
} from '../../domain/products/product.model';
import { OpenSearchClientProvider } from './opensearch.client';
import {
  buildBoolQuery,
  buildSort,
  resolveSortKey,
  type FilterExclusions,
} from './opensearch-query.builder';
import type { ProductIndexDocument } from './product-index.document';
import { toNumber, toOptionalNumber } from '../../database/mappers/numeric';
import { decodeSearchCursor, encodeSearchCursor, extractSearchAfter } from './search-cursor.codec';

@Injectable()
export class OpenSearchProductSearchRepository implements IProductSearchRepository {
  constructor(private readonly os: OpenSearchClientProvider) {}

  async findMany(query: ProductQuery): Promise<PaginatedResult<ProductListItem>> {
    const limit = query.limit ?? 24;
    const page = query.page ?? 1;
    const hasSearch = Boolean(query.search?.trim());
    const sortKey = resolveSortKey(query.sort, hasSearch);
    const sort = buildSort(query.sort, hasSearch);

    let searchAfter: (string | number)[] | undefined;
    if (query.cursor) {
      searchAfter = decodeSearchCursor(query.cursor, query.sort, hasSearch).searchAfter;
    } else if (page > 1) {
      // Offset pages without cursor: approximate via from/size (less stable at scale)
      const from = (page - 1) * limit;
      return this.findManyOffset(query, limit, page, from, sort, sortKey, hasSearch);
    }

    const body: Record<string, unknown> = {
      query: buildBoolQuery(query),
      sort,
      size: limit + 1,
      track_total_hits: true,
    };
    if (searchAfter) body.search_after = searchAfter;

    const response = await this.os.requireClient().search({ index: this.os.index, body });
    const hits = response.body.hits.hits as Array<{
      _source: ProductIndexDocument;
      sort?: unknown[];
    }>;
    const totalRaw = response.body.hits.total;
    const total = typeof totalRaw === 'number' ? totalRaw : totalRaw.value;

    const hasMore = hits.length > limit;
    const pageHits = hits.slice(0, limit);
    const items = pageHits.map((h) => this.toListItem(h._source));

    let nextCursor: string | null = null;
    if (hasMore && pageHits.length > 0) {
      const last = pageHits[pageHits.length - 1]!;
      const sortValues = last.sort ?? extractSearchAfterFromSource(last._source, sortKey);
      nextCursor = encodeSearchCursor({ sort: sortKey, searchAfter: extractSearchAfter(sortValues) });
    }

    return {
      items,
      total,
      page: query.cursor ? page : 1,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore,
      nextCursor,
    };
  }

  private async findManyOffset(
    query: ProductQuery,
    limit: number,
    page: number,
    from: number,
    sort: Record<string, 'asc' | 'desc'>[],
    sortKey: SortOption,
    hasSearch: boolean,
  ): Promise<PaginatedResult<ProductListItem>> {
    const response = await this.os.requireClient().search({
      index: this.os.index,
      body: {
        query: buildBoolQuery(query),
        sort,
        from,
        size: limit + 1,
        track_total_hits: true,
      },
    });

    const hits = response.body.hits.hits as Array<{ _source: ProductIndexDocument; sort?: unknown[] }>;
    const totalRaw = response.body.hits.total;
    const total = typeof totalRaw === 'number' ? totalRaw : totalRaw.value;
    const hasMore = hits.length > limit;
    const pageHits = hits.slice(0, limit);
    const items = pageHits.map((h) => this.toListItem(h._source));

    let nextCursor: string | null = null;
    if (hasMore && pageHits.length > 0) {
      const last = pageHits[pageHits.length - 1]!;
      const sortValues = last.sort ?? extractSearchAfterFromSource(last._source, sortKey);
      nextCursor = encodeSearchCursor({ sort: sortKey, searchAfter: extractSearchAfter(sortValues) });
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore,
      nextCursor,
    };
  }

  async getFacets(query: ProductQuery): Promise<FilterFacets> {
    const facetQuery = {
      ...query,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      attributes: undefined,
    };

    const response = await this.os.requireClient().search({
      index: this.os.index,
      body: {
        size: 0,
        query: buildBoolQuery(facetQuery, {
          brand: true,
          price: true,
          rating: true,
          attributes: true,
        }),
        aggs: {
          brands: { terms: { field: 'brand', size: 50, order: { _count: 'desc' } } },
          categories: {
            terms: { field: 'categorySlug', size: 50, order: { _count: 'desc' } },
            aggs: {
              categoryId: { terms: { field: 'categoryId', size: 1 } },
              categoryName: { terms: { field: 'categoryName', size: 1 } },
            },
          },
          minPrice: { min: { field: 'price' } },
          maxPrice: { max: { field: 'price' } },
          rating4: { range: { field: 'rating', ranges: [{ from: 4 }] } },
          rating3: { range: { field: 'rating', ranges: [{ from: 3 }] } },
          rating2: { range: { field: 'rating', ranges: [{ from: 2 }] } },
          rating1: { range: { field: 'rating', ranges: [{ from: 1 }] } },
          attrNames: {
            nested: { path: 'attributes' },
            aggs: {
              names: {
                terms: { field: 'attributes.name', size: 20 },
                aggs: {
                  values: {
                    terms: { field: 'attributes.value', size: 30, order: { _count: 'desc' } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const aggs = response.body.aggregations as Record<string, unknown>;

    const brands = ((aggs.brands as { buckets: { key: string; doc_count: number }[] }).buckets ?? []).map(
      (b) => ({ name: b.key, count: b.doc_count }),
    );

    const categories = (
      (aggs.categories as {
        buckets: {
          key: string;
          doc_count: number;
          categoryId: { buckets: { key: number }[] };
          categoryName: { buckets: { key: string }[] };
        }[];
      }).buckets ?? []
    ).map((b) => ({
      id: b.categoryId.buckets[0]?.key ?? 0,
      slug: b.key,
      name: b.categoryName.buckets[0]?.key ?? b.key,
      count: b.doc_count,
    }));

    const priceRange = {
      min: toNumber((aggs.minPrice as { value: number | null }).value),
      max: toNumber((aggs.maxPrice as { value: number | null }).value),
    };

    const ratings = [
      { threshold: 4, count: (aggs.rating4 as { buckets: { doc_count: number }[] }).buckets[0]?.doc_count ?? 0 },
      { threshold: 3, count: (aggs.rating3 as { buckets: { doc_count: number }[] }).buckets[0]?.doc_count ?? 0 },
      { threshold: 2, count: (aggs.rating2 as { buckets: { doc_count: number }[] }).buckets[0]?.doc_count ?? 0 },
      { threshold: 1, count: (aggs.rating1 as { buckets: { doc_count: number }[] }).buckets[0]?.doc_count ?? 0 },
    ];

    const attributes: Record<string, { value: string; count: number }[]> = {};
    const nameBuckets =
      (aggs.attrNames as { names: { buckets: { key: string; values: { buckets: { key: string; doc_count: number }[] } }[] } })
        .names?.buckets ?? [];
    for (const nb of nameBuckets) {
      attributes[nb.key] = nb.values.buckets.map((vb) => ({ value: vb.key, count: vb.doc_count }));
    }

    return { brands, priceRange, ratings, categories, attributes };
  }

  async autocomplete(term: string, limit: number): Promise<AutocompleteSuggestion[]> {
    const trimmed = term.trim();
    if (!trimmed) return [];

    const response = await this.os.requireClient().search({
      index: this.os.index,
      body: {
        size: limit,
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: trimmed,
                  type: 'bool_prefix',
                  fields: ['name', 'name.keyword', 'sku', 'brand'],
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
        _source: ['id', 'name', 'slug'],
      },
    });

    const suggestions: AutocompleteSuggestion[] = [];
    const hits = response.body.hits.hits as Array<{ _source: ProductIndexDocument }>;
    for (const h of hits) {
      suggestions.push({
        type: 'product',
        id: h._source.id,
        label: h._source.name,
        slug: h._source.slug,
      });
    }

    if (suggestions.length < limit) {
      const brandAgg = await this.os.requireClient().search({
        index: this.os.index,
        body: {
          size: 0,
          query: { prefix: { brand: { value: trimmed, case_insensitive: true } } },
          aggs: { brands: { terms: { field: 'brand', size: limit - suggestions.length } } },
        },
      });
      const buckets = (brandAgg.body.aggregations as { brands: { buckets: { key: string }[] } }).brands
        .buckets;
      for (const b of buckets) {
        if (!suggestions.some((s) => s.type === 'brand' && s.label === b.key)) {
          suggestions.push({ type: 'brand', id: b.key, label: b.key });
        }
      }
    }

    return suggestions.slice(0, limit);
  }

  private toListItem(doc: ProductIndexDocument): ProductListItem {
    return {
      id: doc.id,
      sku: doc.sku,
      name: doc.name,
      slug: doc.slug,
      brand: doc.brand,
      categoryId: doc.categoryId,
      categoryName: doc.categoryName,
      categorySlug: doc.categorySlug,
      price: toNumber(doc.price),
      compareAtPrice: toOptionalNumber(doc.compareAtPrice),
      currency: doc.currency,
      rating: toNumber(doc.rating),
      reviewCount: Number(doc.reviewCount),
      inStock: Boolean(doc.inStock),
      imageUrl: doc.imageUrl,
      popularityScore: Number(doc.popularityScore),
    };
  }
}

function extractSearchAfterFromSource(
  source: ProductIndexDocument,
  sortKey: SortOption,
): unknown[] {
  switch (sortKey) {
    case 'price_asc':
      return [source.price, source.id];
    case 'price_desc':
      return [source.price, source.id];
    case 'rating':
      return [source.rating, source.reviewCount, source.id];
    case 'newest':
      return [source.createdAt, source.id];
    case 'relevance':
      return [source.popularityScore, source.id];
    case 'popularity':
    default:
      return [source.popularityScore, source.id];
  }
}
