import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DATABASE_ENTITIES, DATABASE_MIGRATIONS } from './database.constants';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT) || 6432,
  username: process.env.DATABASE_USER ?? 'catalog',
  password: process.env.DATABASE_PASSWORD ?? 'catalog',
  database: process.env.DATABASE_NAME ?? 'catalog',
  entities: DATABASE_ENTITIES,
  migrations: DATABASE_MIGRATIONS,
  synchronize: false,
});
