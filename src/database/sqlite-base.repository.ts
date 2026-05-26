import { DataSource } from 'typeorm';
import type Database from 'better-sqlite3';

export abstract class SqliteBaseRepository {
  constructor(protected readonly dataSource: DataSource) {}

  protected get db(): Database.Database {
    return (this.dataSource.driver as unknown as { databaseConnection: Database.Database })
      .databaseConnection;
  }
}
