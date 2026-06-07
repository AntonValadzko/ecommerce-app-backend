import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { type RedisOptions } from 'ioredis';
import type { RedisConfig } from './redis.types';

const REDIS_OPTIONS: RedisOptions = {
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
  lazyConnect: true,
  /** Fail fast instead of queuing commands while disconnected (avoids multi-second stalls). */
  enableOfflineQueue: false,
  connectTimeout: 3_000,
  commandTimeout: 500,
  retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2_000)),
};

@Injectable()
export class RedisClientProvider implements OnModuleDestroy {
  private readonly logger = new Logger(RedisClientProvider.name);
  readonly config: RedisConfig;
  private client: Redis | null = null;
  private connected = false;

  constructor(configService: ConfigService) {
    this.config = configService.get<RedisConfig>('redis')!;
    if (!this.config.enabled) {
      this.logger.warn('Redis is disabled (REDIS_ENABLED=false)');
      return;
    }

    this.client = new Redis(this.config.url, REDIS_OPTIONS);

    this.client.on('ready', () => {
      this.connected = true;
      this.logger.log('Redis connected');
    });
    this.client.on('error', (err) => {
      this.connected = false;
      this.logger.warn(`Redis error: ${err.message}`);
    });
    this.client.on('close', () => {
      this.connected = false;
    });

    void this.client.connect().catch((err: Error) => {
      this.logger.warn(`Redis connect failed: ${err.message}`);
    });
  }

  get redis(): Redis | null {
    return this.client;
  }

  /** Separate connection for blocking commands (BRPOP) so HTTP handlers are not stalled. */
  createDuplicate(): Redis | null {
    if (!this.client || !this.config.enabled) return null;
    return this.client.duplicate({
      ...REDIS_OPTIONS,
      maxRetriesPerRequest: null,
      commandTimeout: undefined,
    });
  }

  isReady(): boolean {
    return Boolean(this.config.enabled && this.client && this.connected && this.client.status === 'ready');
  }

  async ping(): Promise<boolean> {
    if (!this.client || !this.config.enabled) return false;
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit().catch(() => undefined);
    }
  }
}
