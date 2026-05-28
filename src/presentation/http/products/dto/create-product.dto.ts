import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUrl,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateProductCommand } from '../../../../domain/products/product-write.model';
import { ProductAttributeDto } from './product-attribute.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-ELEC-00099' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  sku: string;

  @ApiProperty({ example: 'Wireless Noise-Cancelling Headphones' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @ApiPropertyOptional({
    description: 'URL slug; generated from name when omitted',
    example: 'wireless-noise-cancelling-headphones',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  slug?: string;

  @ApiProperty({ example: 'Premium over-ear headphones with active noise cancellation.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ example: 'SoundMax' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  brand: string;

  @ApiProperty({ example: 1, description: 'Category ID' })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({ example: 149.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 199.99 })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsNumber()
  @Min(0)
  compareAtPrice?: number | null;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 4.5, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: 128, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  reviewCount?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ example: 42, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 100, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  popularityScore?: number;

  @ApiProperty({ example: 'https://picsum.photos/seed/demo-product/400/400' })
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  imageUrl: string;

  @ApiPropertyOptional({ type: [ProductAttributeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];

  toCommand(): CreateProductCommand {
    return {
      sku: this.sku,
      name: this.name,
      slug: this.slug,
      description: this.description,
      brand: this.brand,
      categoryId: this.categoryId,
      price: this.price,
      compareAtPrice: this.compareAtPrice ?? null,
      currency: (this.currency ?? 'USD').toUpperCase(),
      rating: this.rating ?? 0,
      reviewCount: this.reviewCount ?? 0,
      inStock: this.inStock ?? true,
      stockQuantity: this.stockQuantity ?? 0,
      popularityScore: this.popularityScore ?? 0,
      imageUrl: this.imageUrl,
      attributes: (this.attributes ?? []).map((a) => a.toProductAttribute()),
    };
  }
}
