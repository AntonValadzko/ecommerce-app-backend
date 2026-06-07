import { RedisCacheService } from './redis-cache.service';
import { RedisClientProvider } from './redis.client';

describe('RedisCacheService', () => {
  const redisClient = {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    on: jest.fn(),
  };

  let cache: RedisCacheService;
  let provider: RedisClientProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = {
      isReady: jest.fn().mockReturnValue(true),
      redis: redisClient,
      config: {
        keyPrefix: 'catalog:',
        cacheVersionKey: 'cache:version',
      },
    } as unknown as RedisClientProvider;
    cache = new RedisCacheService(provider);
  });

  it('returns cached value on wrap hit', async () => {
    redisClient.get.mockResolvedValue(JSON.stringify({ ok: true }));
    const loader = jest.fn();

    await expect(cache.wrap('key', 60, loader)).resolves.toEqual({ ok: true });
    expect(loader).not.toHaveBeenCalled();
  });

  it('loads and stores value on cache miss', async () => {
    redisClient.get.mockResolvedValue(null);
    const loader = jest.fn().mockResolvedValue({ fresh: true });

    await expect(cache.wrap('key', 60, loader)).resolves.toEqual({ fresh: true });
    expect(redisClient.setex).toHaveBeenCalledWith('catalog:key', 60, JSON.stringify({ fresh: true }));
  });

  it('returns null when redis is unavailable', async () => {
    (provider.isReady as jest.Mock).mockReturnValue(false);

    await expect(cache.get('key')).resolves.toBeNull();
  });

  it('bumps in-memory version when redis is unavailable', async () => {
    (provider.isReady as jest.Mock).mockReturnValue(false);

    await cache.bumpVersion();

    expect(cache.versionedKey(['products'])).toBe('v1:products');
  });
});
