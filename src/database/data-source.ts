import 'reflect-metadata';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { DATABASE_ENTITIES, DATABASE_MIGRATIONS } from './database.constants';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'catalog.db'),
  entities: DATABASE_ENTITIES,
  migrations: DATABASE_MIGRATIONS,
  synchronize: false,
});
