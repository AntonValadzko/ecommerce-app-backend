import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SqliteBaseRepository } from '../../database/sqlite-base.repository';
import type { SavedSearch } from '../saved-search.types';
import type { ProductQuery } from '../../products/product.types';

interface SavedSearchRow {
  id: string;
  session_id: string;
  name: string;
  query_json: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class SavedSearchRepository extends SqliteBaseRepository {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource);
  }

  async findBySession(sessionId: string): Promise<SavedSearch[]> {
    const rows = this.db
      .prepare('SELECT * FROM saved_searches WHERE session_id = ? ORDER BY updated_at DESC')
      .all(sessionId) as SavedSearchRow[];
    return rows.map((r) => this.mapRow(r));
  }

  async create(data: {
    sessionId: string;
    name: string;
    query: ProductQuery;
  }): Promise<SavedSearch> {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO saved_searches (id, session_id, name, query_json, created_at, updated_at)
         VALUES (@id, @sessionId, @name, @queryJson, @createdAt, @updatedAt)`,
      )
      .run({
        id,
        sessionId: data.sessionId,
        name: data.name,
        queryJson: JSON.stringify(data.query),
        createdAt: now,
        updatedAt: now,
      });

    return {
      id,
      sessionId: data.sessionId,
      name: data.name,
      query: data.query,
      createdAt: now,
      updatedAt: now,
    };
  }

  async delete(id: string, sessionId: string): Promise<boolean> {
    const result = this.db
      .prepare('DELETE FROM saved_searches WHERE id = ? AND session_id = ?')
      .run(id, sessionId);
    return result.changes > 0;
  }

  private mapRow(row: SavedSearchRow): SavedSearch {
    return {
      id: row.id,
      sessionId: row.session_id,
      name: row.name,
      query: JSON.parse(row.query_json) as ProductQuery,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
