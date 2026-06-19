/**
 * Blueprint — domain port for post-write search sync.
 * Replaces direct ProductIndexQueueService injection in cache decorators.
 */
export const PRODUCT_INDEX_SYNC = Symbol('PRODUCT_INDEX_SYNC');

export interface IProductIndexSync {
  /** Queue or synchronously index one product after Postgres write. */
  afterProductChange(productId: number): Promise<void>;
}
