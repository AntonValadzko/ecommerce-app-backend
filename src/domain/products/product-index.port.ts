export const PRODUCT_INDEXER = Symbol('PRODUCT_INDEXER');

export interface IProductIndexer {
  indexProduct(productId: number): Promise<void>;
}
