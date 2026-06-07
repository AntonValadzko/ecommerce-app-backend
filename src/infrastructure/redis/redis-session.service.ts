import { Injectable, Logger } from '@nestjs/common';
import { RedisClientProvider } from './redis.client';

@Injectable()
export class RedisSessionService {
  private readonly logger = new Logger(RedisSessionService.name);

  constructor(private readonly redisProvider: RedisClientProvider) {}

  async touch(sessionId: string): Promise<void> {
    const client = this.redisProvider.redis;
    if (!this.redisProvider.isReady() || !client) return;

    const key = `${this.redisProvider.config.keyPrefix}session:${sessionId}`;
    try {
      await client.setex(key, this.redisProvider.config.sessionTtlSec, '1');
    } catch (err) {
      this.logger.warn(`Session touch failed: ${(err as Error).message}`);
    }
  }
}
