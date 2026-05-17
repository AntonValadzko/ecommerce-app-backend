import path from 'node:path';

const rootDir = path.resolve(process.cwd());

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  dbPath: process.env.DB_PATH ?? path.join(rootDir, 'data', 'catalog.db'),
  defaultPageSize: 24,
  allowedPageSizes: [24, 48, 96] as const,
  maxPageSize: 96,
  autocompleteLimit: 10,
  relatedProductsLimit: 6,
} as const;

export type PageSize = (typeof config.allowedPageSizes)[number];
