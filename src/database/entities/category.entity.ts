import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'created_at', type: 'text', default: () => "datetime('now')" })
  createdAt: string;
}
