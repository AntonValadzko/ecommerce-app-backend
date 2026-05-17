import { z } from 'zod';
import { config } from '../../config/index.js';

const sortOptions = [
  'relevance',
  'price_asc',
  'price_desc',
  'rating',
  'popularity',
  'newest',
] as const;

export const productListQuerySchema = z.object({
  q: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  category: z.string().optional(),
  brand: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v === undefined ? undefined : Array.isArray(v) ? v : [v])),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  inStock: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  sort: z.enum(sortOptions).optional().default('relevance'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .optional()
    .transform((v) => {
      if (!v) return config.defaultPageSize;
      return (config.allowedPageSizes as readonly number[]).includes(v)
        ? v
        : config.defaultPageSize;
    }),
  cursor: z.string().optional(),
  attributes: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      try {
        return JSON.parse(v) as Record<string, string[]>;
      } catch {
        return undefined;
      }
    }),
});

export const autocompleteQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
});

export const savedSearchBodySchema = z.object({
  name: z.string().min(1).max(100),
  query: z.record(z.unknown()),
});

export type ProductListQueryInput = z.infer<typeof productListQuerySchema>;

export function toProductQuery(input: ProductListQueryInput) {
  return {
    search: input.q,
    categoryId: input.categoryId,
    categorySlug: input.category,
    brand: input.brand,
    minPrice: input.minPrice,
    maxPrice: input.maxPrice,
    minRating: input.minRating,
    inStock: input.inStock,
    sort: input.sort,
    page: input.page,
    limit: input.limit,
    cursor: input.cursor,
    attributes: input.attributes,
  };
}
