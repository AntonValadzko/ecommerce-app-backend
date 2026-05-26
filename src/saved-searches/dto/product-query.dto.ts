import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import type { SortOption } from '../../products/product.types';

const SORT_OPTIONS = [
  'relevance',
  'price_asc',
  'price_desc',
  'rating',
  'popularity',
  'newest',
] as const;

export class SavedProductQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsInt() @Min(1) categoryId?: number;
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) brand?: string[];
  @IsOptional() @IsNumber() @Min(0) minPrice?: number;
  @IsOptional() @IsNumber() @Min(0) maxPrice?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(5) minRating?: number;
  @IsOptional() @IsBoolean() inStock?: boolean;
  @IsOptional() @IsObject() attributes?: Record<string, string[]>;
  @IsOptional() @IsIn(SORT_OPTIONS) sort?: SortOption;
  @IsOptional() @IsInt() @Min(1) page?: number;
  @IsOptional() @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsString() cursor?: string;
}
