import { DataSource } from 'typeorm';
import type Database from 'better-sqlite3';

/**
 * Base class for repositories that need direct better-sqlite3 access
 * (e.g. FTS5 virtual tables). Standard CRUD should use TypeORM entities instead.
 */
export abstract class SqliteBaseRepository {
  constructor(protected readonly dataSource: DataSource) {}

  protected get db(): Database.Database {
    return (this.dataSource.driver as unknown as { databaseConnection: Database.Database })
      .databaseConnection;
  }
}
