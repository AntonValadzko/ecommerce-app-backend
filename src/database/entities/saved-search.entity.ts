import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('saved_searches')
export class SavedSearchEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ name: 'session_id', type: 'text' })
  sessionId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'query_json', type: 'jsonb' })
  queryJson: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;
}
