import { RedisSessionService } from './redis-session.service';
import { RedisClientProvider } from './redis.client';

describe('RedisSessionService', () => {
  const redisClient = {
    setex: jest.fn(),
  };

  const redisProvider = {
    isReady: jest.fn(),
    redis: redisClient,
    config: {
      keyPrefix: 'catalog:',
      sessionTtlSec: 3600,
    },
  } as unknown as RedisClientProvider;

  const service = new RedisSessionService(redisProvider);

  beforeEach(() => {
    jest.clearAllMocks();
    redisProvider.isReady = jest.fn().mockReturnValue(true);
  });

  it('touches session key with ttl', async () => {
    await service.touch('session-123');

    expect(redisClient.setex).toHaveBeenCalledWith('catalog:session:session-123', 3600, '1');
  });

  it('no-ops when redis is unavailable', async () => {
    redisProvider.isReady = jest.fn().mockReturnValue(false);

    await service.touch('session-123');

    expect(redisClient.setex).not.toHaveBeenCalled();
  });
});
