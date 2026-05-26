import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('saved_searches')
export class SavedSearchEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ name: 'session_id', type: 'text' })
  sessionId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'query_json', type: 'text' })
  queryJson: string;

  @Column({ name: 'created_at', type: 'text', default: () => "datetime('now')" })
  createdAt: string;

  @Column({ name: 'updated_at', type: 'text', default: () => "datetime('now')" })
  updatedAt: string;
}
