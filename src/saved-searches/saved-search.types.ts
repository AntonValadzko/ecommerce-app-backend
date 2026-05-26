import type { ProductQuery } from '../products/product.types';

export interface SavedSearch {
  id: string;
  sessionId: string;
  name: string;
  query: ProductQuery;
  createdAt: string;
  updatedAt: string;
}
