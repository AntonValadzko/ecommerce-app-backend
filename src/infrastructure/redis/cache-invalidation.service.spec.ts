import { CacheInvalidationService } from './cache-invalidation.service';
import { RedisCacheService } from './redis-cache.service';

describe('CacheInvalidationService', () => {
  it('bumps cache version on catalog mutation', async () => {
    const cache = { bumpVersion: jest.fn() } as unknown as RedisCacheService;
    const service = new CacheInvalidationService(cache);

    await service.onCatalogMutation();

    expect(cache.bumpVersion).toHaveBeenCalled();
  });
});
