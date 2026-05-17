import type { ProductQuery } from './product.js';

export interface SavedSearch {
  id: string;
  sessionId: string;
  name: string;
  query: ProductQuery;
  createdAt: string;
  updatedAt: string;
}
