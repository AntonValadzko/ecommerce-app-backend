import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { ProductQuery, SortOption } from '../product.types';

const SORT_OPTIONS = ['relevance', 'price_asc', 'price_desc', 'rating', 'popularity', 'newest'] as const;
const ALLOWED_LIMITS = [24, 48, 96] as const;

export class ProductListQueryDto {
  @ApiPropertyOptional({ description: 'Full-text search term' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value as string, 10) : undefined))
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by brand(s)', type: [String] })
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value : value ? [value as string] : undefined,
  )
  @IsArray()
  @IsString({ each: true })
  brand?: string[];

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value as string) : undefined))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value as string) : undefined))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Minimum rating (1-5)' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value as string) : undefined))
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Filter in-stock items only' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ enum: SORT_OPTIONS })
  @IsOptional()
  @IsIn(SORT_OPTIONS)
  sort?: SortOption;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value as string, 10) : 1))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', enum: ALLOWED_LIMITS, default: 24 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value as string, 10) : 24))
  @IsIn(ALLOWED_LIMITS)
  limit?: number = 24;

  @ApiPropertyOptional({ description: 'Cursor for cursor-based pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Attribute filters as JSON string', type: 'string' })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    try {
      return JSON.parse(value as string) as Record<string, string[]>;
    } catch {
      return undefined;
    }
  })
  attributes?: Record<string, string[]>;

  toProductQuery(): ProductQuery {
    return {
      search: this.q,
      categoryId: this.categoryId,
      categorySlug: this.category,
      brand: this.brand,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minRating: this.minRating,
      inStock: this.inStock,
      attributes: this.attributes,
      sort: this.sort,
      page: this.page ?? 1,
      limit: this.limit ?? 24,
      cursor: this.cursor,
    };
  }
}
