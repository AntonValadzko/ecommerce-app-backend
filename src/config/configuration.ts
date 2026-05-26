import * as path from 'path';

export type PageSize = 24 | 48 | 96;

export default () => ({
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  dbPath: process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'catalog.db'),
  defaultPageSize: 24 as PageSize,
  allowedPageSizes: [24, 48, 96] as PageSize[],
  maxPageSize: 96,
  autocompleteLimit: 10,
  relatedProductsLimit: 6,
});
