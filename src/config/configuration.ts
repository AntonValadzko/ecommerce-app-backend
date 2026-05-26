export type PageSize = 24 | 48 | 96;

export default () => ({
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT) || 6432,
    username: process.env.DATABASE_USER ?? 'catalog',
    password: process.env.DATABASE_PASSWORD ?? 'catalog',
    database: process.env.DATABASE_NAME ?? 'catalog',
  },
  opensearch: {
    node: process.env.OPENSEARCH_NODE ?? 'http://localhost:9200',
    index: process.env.OPENSEARCH_INDEX ?? 'products',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  defaultPageSize: 24 as PageSize,
  allowedPageSizes: [24, 48, 96] as PageSize[],
  maxPageSize: 96,
  autocompleteLimit: 10,
  relatedProductsLimit: 6,
});
