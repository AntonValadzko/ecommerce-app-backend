import { HttpException, HttpStatus } from '@nestjs/common';
import { RedisRateLimitMiddleware } from './redis-rate-limit.middleware';
import { RedisClientProvider } from './redis.client';

describe('RedisRateLimitMiddleware', () => {
  const redisClient = {
    incr: jest.fn(),
    expire: jest.fn(),
  };

  let redisProvider: RedisClientProvider;
  let middleware: RedisRateLimitMiddleware;

  beforeEach(() => {
    jest.clearAllMocks();
    redisProvider = {
      isReady: jest.fn().mockReturnValue(true),
      redis: redisClient,
      config: {
        keyPrefix: 'catalog:',
        rateLimit: { windowSec: 60, maxRequests: 2 },
      },
    } as unknown as RedisClientProvider;
    middleware = new RedisRateLimitMiddleware(redisProvider);
  });

  it('skips rate limiting when redis is not ready', async () => {
    (redisProvider.isReady as jest.Mock).mockReturnValue(false);
    const next = jest.fn();

    await middleware.use({ ip: '1.1.1.1', method: 'GET', path: '/api' } as never, { setHeader: jest.fn() } as never, next);

    expect(next).toHaveBeenCalled();
    expect(redisClient.incr).not.toHaveBeenCalled();
  });

  it('sets rate limit headers and allows requests under limit', async () => {
    redisClient.incr.mockResolvedValue(1);
    const setHeader = jest.fn();
    const next = jest.fn();

    await middleware.use(
      { ip: '1.1.1.1', method: 'GET', baseUrl: '/api/v1/products', path: '/api/v1/products' } as never,
      { setHeader } as never,
      next,
    );

    expect(redisClient.expire).toHaveBeenCalledWith('catalog:rate:1.1.1.1:GET:/api/v1/products', 60);
    expect(setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '2');
    expect(next).toHaveBeenCalled();
  });

  it('returns 429 when limit exceeded', async () => {
    redisClient.incr.mockResolvedValue(3);
    const setHeader = jest.fn();
    const next = jest.fn();

    await expect(
      middleware.use(
        { ip: '1.1.1.1', method: 'GET', baseUrl: '/api/v1/products', path: '/api/v1/products' } as never,
        { setHeader } as never,
        next,
      ),
    ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
  });

  it('continues when redis command fails', async () => {
    redisClient.incr.mockRejectedValue(new Error('redis down'));
    const next = jest.fn();

    await middleware.use(
      { ip: '1.1.1.1', method: 'GET', baseUrl: '/api/v1/products', path: '/api/v1/products' } as never,
      { setHeader: jest.fn() } as never,
      next,
    );

    expect(next).toHaveBeenCalled();
  });
});
