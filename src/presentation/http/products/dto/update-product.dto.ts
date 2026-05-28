import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import type { UpdateProductInput } from '../../../../domain/products/product-write.model';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  toUpdateProductInput(): UpdateProductInput {
    const input: UpdateProductInput = {};

    if (this.sku !== undefined) input.sku = this.sku;
    if (this.name !== undefined) input.name = this.name;
    if (this.slug !== undefined) input.slug = this.slug;
    if (this.description !== undefined) input.description = this.description;
    if (this.brand !== undefined) input.brand = this.brand;
    if (this.categoryId !== undefined) input.categoryId = this.categoryId;
    if (this.price !== undefined) input.price = this.price;
    if (this.compareAtPrice !== undefined) input.compareAtPrice = this.compareAtPrice;
    if (this.currency !== undefined) input.currency = this.currency.toUpperCase();
    if (this.rating !== undefined) input.rating = this.rating;
    if (this.reviewCount !== undefined) input.reviewCount = this.reviewCount;
    if (this.inStock !== undefined) input.inStock = this.inStock;
    if (this.stockQuantity !== undefined) input.stockQuantity = this.stockQuantity;
    if (this.popularityScore !== undefined) input.popularityScore = this.popularityScore;
    if (this.imageUrl !== undefined) input.imageUrl = this.imageUrl;
    if (this.attributes !== undefined) {
      input.attributes = this.attributes.map((a) => a.toProductAttribute());
    }

    return input;
  }
}
