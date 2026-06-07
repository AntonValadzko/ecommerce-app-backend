import { resolveProductImageUrl } from './seed-product-images';

describe('resolveProductImageUrl', () => {
  it('uses keyword-specific seed when product name matches', () => {
    const url = resolveProductImageUrl('Wireless Earbuds Pro', 'electronics', 'sku-1');

    expect(url).toContain('https://picsum.photos/seed/');
    expect(url).toContain('audio-sku-1');
  });

  it('falls back to category slug when no keyword matches', () => {
    const url = resolveProductImageUrl('Mystery Item', 'home-garden', 'sku-2');

    expect(url).toContain('home-garden-sku-2');
  });
});
