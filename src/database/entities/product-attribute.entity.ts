import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_attributes')
export class ProductAttributeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => ProductEntity, (product) => product.attributes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  value: string;
}
