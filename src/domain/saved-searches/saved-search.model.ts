import type { ProductQuery } from '../products/product.model';

export interface SavedSearch {
  id: string;
  sessionId: string;
  name: string;
  query: ProductQuery;
  createdAt: string;
  updatedAt: string;
}
