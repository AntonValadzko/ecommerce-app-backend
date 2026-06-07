import { BadRequestException } from '@nestjs/common';
import {
  decodeSearchCursor,
  encodeSearchCursor,
  extractSearchAfter,
} from './search-cursor.codec';

describe('search-cursor.codec', () => {
  it('round-trips cursor encoding', () => {
    const cursor = { sort: 'popularity' as const, searchAfter: [100, 1] };
    const encoded = encodeSearchCursor(cursor);

    expect(decodeSearchCursor(encoded, undefined, false)).toEqual(cursor);
  });

  it('throws when cursor sort does not match query sort', () => {
    const encoded = encodeSearchCursor({ sort: 'price_asc', searchAfter: [10, 1] });

    expect(() => decodeSearchCursor(encoded, 'popularity', false)).toThrow(BadRequestException);
  });

  it('throws for invalid cursor payload', () => {
    expect(() => decodeSearchCursor('not-valid', undefined, false)).toThrow(BadRequestException);
    const emptySearchAfter = Buffer.from(JSON.stringify({ sort: 'popularity', searchAfter: [] })).toString(
      'base64url',
    );
    expect(() => decodeSearchCursor(emptySearchAfter, undefined, false)).toThrow(BadRequestException);
  });

  it('extractSearchAfter coerces values to string or number', () => {
    expect(extractSearchAfter([1, 'abc', true])).toEqual([1, 'abc', 'true']);
  });
});
