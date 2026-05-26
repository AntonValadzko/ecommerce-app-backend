import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductAttributeEntity } from './entities/product-attribute.entity';
import {
  ATTRIBUTE_TEMPLATES,
  BRANDS_BY_CATEGORY,
  CATEGORIES,
  PRODUCT_NAMES,
} from './seed-data';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

@Injectable()
export class BulkLoadService {
  private readonly logger = new Logger(BulkLoadService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async loadDemoCatalog(clearExisting = true): Promise<{ categories: number; products: number }> {
    return this.dataSource.transaction(async (manager) => {
      if (clearExisting) {
        await this.clearCatalogTables(manager);
      }

      const categoryIds = await this.insertCategories(manager);
      const products = await this.insertProducts(manager, categoryIds);
      this.logger.log(`Loaded ${CATEGORIES.length} categories and ${products} products into Postgres`);
      return { categories: CATEGORIES.length, products };
    });
  }

  /**
   * TypeORM `clear()` uses TRUNCATE without CASCADE, which fails on Postgres when
   * tables have FKs (products → categories, categories.parent_id → categories).
   */
  private async clearCatalogTables(manager: EntityManager): Promise<void> {
    await manager.query(
      'TRUNCATE TABLE product_attributes, products, categories RESTART IDENTITY CASCADE',
    );
  }

  private async insertCategories(manager: EntityManager): Promise<Record<string, number>> {
    const categoryIds: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      const saved = await manager.save(CategoryEntity, {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
      });
      categoryIds[cat.slug] = saved.id;
    }
    return categoryIds;
  }

  private async insertProducts(
    manager: EntityManager,
    categoryIds: Record<string, number>,
  ): Promise<number> {
    let productIndex = 0;

    for (const cat of CATEGORIES) {
      const names = PRODUCT_NAMES[cat.slug] ?? [];
      const brands = BRANDS_BY_CATEGORY[cat.slug] ?? ['Generic'];
      const attrs = ATTRIBUTE_TEMPLATES[cat.slug] ?? [];

      for (let i = 0; i < 10; i++) {
        productIndex++;
        const baseName = names[i] ?? `${cat.name} Product ${i + 1}`;
        const brand = brands[i % brands.length]!;
        const slug = `${slugify(baseName)}-${productIndex}`;
        const sku = `SKU-${cat.slug.toUpperCase().slice(0, 3)}-${String(productIndex).padStart(4, '0')}`;
        const price = Math.round((15 + Math.random() * 485) * 100) / 100;
        const hasDiscount = Math.random() > 0.6;
        const compareAtPrice = hasDiscount
          ? Math.round(price * (1.1 + Math.random() * 0.4) * 100) / 100
          : null;
        const rating = Math.round((2.5 + Math.random() * 2.5) * 10) / 10;
        const reviewCount = Math.floor(Math.random() * 2500);
        const inStock = Math.random() > 0.12;
        const stockQuantity = inStock ? Math.floor(Math.random() * 500) + 1 : 0;
        const popularityScore = Math.floor(Math.random() * 10000);

        const product = await manager.save(ProductEntity, {
          sku,
          name: baseName,
          slug,
          description: `Premium ${baseName} from ${brand}. Ideal for everyday use in the ${cat.name} category. Features high-quality materials and excellent value.`,
          brand,
          categoryId: categoryIds[cat.slug],
          price,
          compareAtPrice,
          currency: 'USD',
          rating,
          reviewCount,
          inStock,
          stockQuantity,
          popularityScore,
          imageUrl: `https://picsum.photos/seed/${slug}/400/400`,
        });

        for (const attrDef of attrs) {
          await manager.save(ProductAttributeEntity, {
            productId: product.id,
            name: attrDef.name,
            value: pick(attrDef.values),
          });
        }
      }
    }

    return productIndex;
  }
}
