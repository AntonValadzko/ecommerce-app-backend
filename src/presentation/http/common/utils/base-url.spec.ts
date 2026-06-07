import { getBaseUrl } from './base-url';
import type { Request } from 'express';

describe('getBaseUrl', () => {
  it('builds url from protocol and host header', () => {
    const req = {
      protocol: 'https',
      get: (name: string) => (name === 'host' ? 'shop.example.com' : undefined),
    } as Request;

    expect(getBaseUrl(req)).toBe('https://shop.example.com');
  });
});
