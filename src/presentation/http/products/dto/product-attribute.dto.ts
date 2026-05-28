import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { ProductAttribute } from '../../../../domain/products/product.model';

export class ProductAttributeDto {
  @ApiProperty({ example: 'Color' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Black' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  value: string;

  toProductAttribute(): ProductAttribute {
    return { name: this.name, value: this.value };
  }
}
