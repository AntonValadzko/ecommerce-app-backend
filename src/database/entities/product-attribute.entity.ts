import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('product_attributes')
export class ProductAttributeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  value: string;
}
