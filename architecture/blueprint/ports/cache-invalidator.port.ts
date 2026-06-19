/**
 * Blueprint — domain port for cache invalidation on catalog mutations.
 */
export const CACHE_INVALIDATOR = Symbol('CACHE_INVALIDATOR');

export interface ICacheInvalidator {
  onCatalogMutation(): Promise<void>;
}
