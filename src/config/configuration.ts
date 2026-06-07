export type PageSize = 24 | 48 | 96;

export default () => ({
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
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
    enabled: process.env.REDIS_ENABLED !== 'false',
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'catalog:',
    cacheVersionKey: 'cache:version',
    sessionTtlSec: Number(process.env.REDIS_SESSION_TTL_SEC) || 60 * 60 * 24 * 30,
    cacheTtl: {
      categories: Number(process.env.REDIS_TTL_CATEGORIES_SEC) || 3600,
      categorySlug: Number(process.env.REDIS_TTL_CATEGORY_SLUG_SEC) || 3600,
      product: Number(process.env.REDIS_TTL_PRODUCT_SEC) || 300,
      productRelated: Number(process.env.REDIS_TTL_PRODUCT_RELATED_SEC) || 300,
      list: Number(process.env.REDIS_TTL_LIST_SEC) || 120,
      facets: Number(process.env.REDIS_TTL_FACETS_SEC) || 120,
      autocomplete: Number(process.env.REDIS_TTL_AUTOCOMPLETE_SEC) || 60,
      savedSearches: Number(process.env.REDIS_TTL_SAVED_SEARCHES_SEC) || 600,
    },
    rateLimit: {
      windowSec: Number(process.env.REDIS_RATE_LIMIT_WINDOW_SEC) || 60,
      maxRequests: Number(process.env.REDIS_RATE_LIMIT_MAX) || 200,
    },
    indexQueueKey: 'queue:index:products',
  },
  defaultPageSize: 24 as PageSize,
  allowedPageSizes: [24, 48, 96] as PageSize[],
  maxPageSize: 96,
  autocompleteLimit: 10,
  relatedProductsLimit: 6,
});
