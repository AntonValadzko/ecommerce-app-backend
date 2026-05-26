import type { SortOption } from './product.model';

/** OpenSearch search_after cursor (stable under index updates). */
export interface SearchCursor {
  sort: SortOption;
  searchAfter: (string | number)[];
}
