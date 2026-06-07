export interface RedisConfig {
  url: string;
  enabled: boolean;
  keyPrefix: string;
  cacheVersionKey: string;
  sessionTtlSec: number;
  cacheTtl: {
    categories: number;
    categorySlug: number;
    product: number;
    productRelated: number;
    list: number;
    facets: number;
    autocomplete: number;
    savedSearches: number;
  };
  rateLimit: {
    windowSec: number;
    maxRequests: number;
  };
  indexQueueKey: string;
}
