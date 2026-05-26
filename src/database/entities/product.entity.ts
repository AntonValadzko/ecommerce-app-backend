import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'text' })
  sku: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ unique: true, type: 'text' })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  brand: string;

  @Column({ name: 'category_id', type: 'integer' })
  categoryId: number;

  @Column({ type: 'real' })
  price: number;

  @Column({ name: 'compare_at_price', type: 'real', nullable: true })
  compareAtPrice: number | null;

  @Column({ type: 'text', default: 'USD' })
  currency: string;

  @Column({ type: 'real', default: 0 })
  rating: number;

  @Column({ name: 'review_count', type: 'integer', default: 0 })
  reviewCount: number;

  @Column({ name: 'in_stock', type: 'integer', default: 1 })
  inStock: number;

  @Column({ name: 'stock_quantity', type: 'integer', default: 0 })
  stockQuantity: number;

  @Column({ name: 'popularity_score', type: 'integer', default: 0 })
  popularityScore: number;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ name: 'created_at', type: 'text', default: () => "datetime('now')" })
  createdAt: string;

  @Column({ name: 'updated_at', type: 'text', default: () => "datetime('now')" })
  updatedAt: string;
}
