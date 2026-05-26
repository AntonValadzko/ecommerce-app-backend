import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'text' })
  slug: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'parent_id', type: 'integer', nullable: true })
  parentId: number | null;

  @ManyToOne(() => CategoryEntity, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: CategoryEntity | null;

  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children: CategoryEntity[];

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];

  /** Populated by loadRelationCountAndMap in queries. */
  productCount?: number;
}
