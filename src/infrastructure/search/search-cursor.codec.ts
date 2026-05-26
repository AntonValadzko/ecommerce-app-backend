import { BadRequestException } from '@nestjs/common';
import type { SearchCursor } from '../../domain/products/search-cursor.model';
import type { SortOption } from '../../domain/products/product.model';
import { resolveSortKey } from './opensearch-query.builder';

export function encodeSearchCursor(cursor: SearchCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

export function decodeSearchCursor(
  raw: string,
  querySort: SortOption | undefined,
  hasSearch: boolean,
): SearchCursor {
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString()) as SearchCursor;
    if (!Array.isArray(parsed.searchAfter) || parsed.searchAfter.length === 0) {
      throw new Error('invalid searchAfter');
    }
    const expectedSort = resolveSortKey(querySort, hasSearch);
    if (parsed.sort !== expectedSort) {
      throw new BadRequestException('Cursor sort does not match current sort parameter');
    }
    return parsed;
  } catch (e) {
    if (e instanceof BadRequestException) throw e;
    throw new BadRequestException('Invalid cursor value');
  }
}

export function extractSearchAfter(sortValues: unknown[]): (string | number)[] {
  return sortValues.map((v) => {
    if (typeof v === 'number' || typeof v === 'string') return v;
    return String(v);
  });
}
