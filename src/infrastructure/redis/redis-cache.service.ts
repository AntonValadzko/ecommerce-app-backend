import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisClientProvider } from './redis.client';

@Injectable()
export class RedisCacheService implements OnModuleInit {
  private readonly logger = new Logger(RedisCacheService.name);
  private cacheVersion = 0;

  constructor(private readonly redisProvider: RedisClientProvider) {}

  onModuleInit(): void {
    const client = this.redisProvider.redis;
    if (!client) return;

    client.on('ready', () => {
      void this.refreshVersionFromRedis();
    });
    if (this.redisProvider.isReady()) {
      void this.refreshVersionFromRedis();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const client = this.redisProvider.redis;
    if (!this.redisProvider.isReady() || !client) return null;

    try {
      const raw = await client.get(this.prefixed(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(`Cache get failed for ${key}: ${(err as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSec: number): Promise<void> {
    const client = this.redisProvider.redis;
    if (!this.redisProvider.isReady() || !client) return;

    try {
      await client.setex(this.prefixed(key), ttlSec, JSON.stringify(value));
    } catch (err) {
      this.logger.warn(`Cache set failed for ${key}: ${(err as Error).message}`);
    }
  }

  /** Read-through cache: returns cached value or runs loader and stores result. */
  async wrap<T>(key: string, ttlSec: number, loader: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await loader();
    if (value !== null && value !== undefined) {
      await this.set(key, value, ttlSec);
    }
    return value;
  }

  async del(key: string): Promise<void> {
    const client = this.redisProvider.redis;
    if (!this.redisProvider.isReady() || !client) return;

    try {
      await client.del(this.prefixed(key));
    } catch (err) {
      this.logger.warn(`Cache del failed for ${key}: ${(err as Error).message}`);
    }
  }

  async getVersion(): Promise<number> {
    return this.cacheVersion;
  }

  async bumpVersion(): Promise<void> {
    const client = this.redisProvider.redis;
    if (!this.redisProvider.isReady() || !client) {
      this.cacheVersion += 1;
      return;
    }

    try {
      const next = await client.incr(this.prefixed(this.redisProvider.config.cacheVersionKey));
      this.cacheVersion = Number(next);
    } catch (err) {
      this.cacheVersion += 1;
      this.logger.warn(`Cache version bump failed: ${(err as Error).message}`);
    }
  }

  versionedKey(parts: string[]): string {
    return `v${this.cacheVersion}:${parts.join(':')}`;
  }

  private async refreshVersionFromRedis(): Promise<void> {
    const client = this.redisProvider.redis;
    if (!client) return;

    try {
      const raw = await client.get(this.prefixed(this.redisProvider.config.cacheVersionKey));
      this.cacheVersion = raw ? Number(raw) : 0;
    } catch {
      /* keep in-memory version */
    }
  }

  private prefixed(key: string): string {
    return `${this.redisProvider.config.keyPrefix}${key}`;
  }
}
