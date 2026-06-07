import { Global, Module } from '@nestjs/common';
import { RedisClientProvider } from './redis.client';
import { RedisCacheService } from './redis-cache.service';
import { CacheInvalidationService } from './cache-invalidation.service';
import { RedisSessionService } from './redis-session.service';

@Global()
@Module({
  providers: [
    RedisClientProvider,
    RedisCacheService,
    CacheInvalidationService,
    RedisSessionService,
  ],
  exports: [RedisClientProvider, RedisCacheService, CacheInvalidationService, RedisSessionService],
})
export class RedisModule {}
