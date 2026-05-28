import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ProductEntity } from '../../../database/entities/product.entity';
import { ProductAttributeEntity } from '../../../database/entities/product-attribute.entity';
import { toProduct, toProductListItem, toQuickViewProduct } from '../../../database/mappers/product.mapper';
import type { IProductRepository } from '../../../domain/products/product.repository.port';
import type { Product, ProductListItem, QuickViewProduct } from '../../../domain/products/product.model';
import type { CreateProductInput, UpdateProductInput } from '../../../domain/products/product-write.model';

const PRODUCT_RELATIONS = ['category', 'attributes'] as const;

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductAttributeEntity)
    private readonly attributeRepo: Repository<ProductAttributeEntity>,
  ) {}

  async findById(id: number): Promise<Product | null> {
    const entity = await this.productRepo.findOne({
      where: { id },
      relations: [...PRODUCT_RELATIONS],
    });
    return entity ? toProduct(entity) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const entity = await this.productRepo.findOne({
      where: { slug },
      relations: [...PRODUCT_RELATIONS],
    });
    return entity ? toProduct(entity) : null;
  }

  async findQuickView(id: number): Promise<QuickViewProduct | null> {
    const entity = await this.productRepo.findOne({
      where: { id },
      relations: ['attributes'],
    });
    return entity ? toQuickViewProduct(entity) : null;
  }

  async findRelated(productId: number, limit: number): Promise<ProductListItem[]> {
    const source = await this.productRepo.findOne({
      where: { id: productId },
      select: ['id', 'categoryId'],
    });
    if (!source) return [];

    const entities = await this.productRepo.find({
      where: { categoryId: source.categoryId, id: Not(productId) },
      relations: ['category'],
      order: { popularityScore: 'DESC', id: 'DESC' },
      take: limit,
    });

    return entities.map(toProductListItem);
  }

  async existsBySku(sku: string, excludeId?: number): Promise<boolean> {
    const where = excludeId != null ? { sku, id: Not(excludeId) } : { sku };
    return (await this.productRepo.count({ where })) > 0;
  }

  async existsBySlug(slug: string, excludeId?: number): Promise<boolean> {
    const where = excludeId != null ? { slug, id: Not(excludeId) } : { slug };
    return (await this.productRepo.count({ where })) > 0;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const saved = await this.productRepo.save(
      this.productRepo.create({
        sku: input.sku,
        name: input.name,
        slug: input.slug,
        description: input.description,
        brand: input.brand,
        categoryId: input.categoryId,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        currency: input.currency,
        rating: input.rating,
        reviewCount: input.reviewCount,
        inStock: input.inStock,
        stockQuantity: input.stockQuantity,
        popularityScore: input.popularityScore,
        imageUrl: input.imageUrl,
      }),
    );

    if (input.attributes.length > 0) {
      await this.attributeRepo.save(
        input.attributes.map((a) =>
          this.attributeRepo.create({ productId: saved.id, name: a.name, value: a.value }),
        ),
      );
    }

    const product = await this.findById(saved.id);
    if (!product) throw new Error('Failed to load product after create');
    return product;
  }

  async update(id: number, input: UpdateProductInput): Promise<Product | null> {
    const entity = await this.productRepo.findOne({ where: { id } });
    if (!entity) return null;

    if (input.sku !== undefined) entity.sku = input.sku;
    if (input.name !== undefined) entity.name = input.name;
    if (input.slug !== undefined) entity.slug = input.slug;
    if (input.description !== undefined) entity.description = input.description;
    if (input.brand !== undefined) entity.brand = input.brand;
    if (input.categoryId !== undefined) entity.categoryId = input.categoryId;
    if (input.price !== undefined) entity.price = input.price;
    if (input.compareAtPrice !== undefined) entity.compareAtPrice = input.compareAtPrice;
    if (input.currency !== undefined) entity.currency = input.currency;
    if (input.rating !== undefined) entity.rating = input.rating;
    if (input.reviewCount !== undefined) entity.reviewCount = input.reviewCount;
    if (input.inStock !== undefined) entity.inStock = input.inStock;
    if (input.stockQuantity !== undefined) entity.stockQuantity = input.stockQuantity;
    if (input.popularityScore !== undefined) entity.popularityScore = input.popularityScore;
    if (input.imageUrl !== undefined) entity.imageUrl = input.imageUrl;
    entity.updatedAt = new Date();

    await this.productRepo.save(entity);

    if (input.attributes !== undefined) {
      await this.attributeRepo.delete({ productId: id });
      if (input.attributes.length > 0) {
        await this.attributeRepo.save(
          input.attributes.map((a) =>
            this.attributeRepo.create({ productId: id, name: a.name, value: a.value }),
          ),
        );
      }
    }

    return this.findById(id);
  }
}
