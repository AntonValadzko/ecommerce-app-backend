import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type Redis from 'ioredis';
import { RedisClientProvider } from '../redis/redis.client';
import { ProductIndexerService } from './product-indexer.service';

@Injectable()
export class ProductIndexQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProductIndexQueueService.name);
  private workerRunning = false;
  private workerClient: Redis | null = null;

  constructor(
    private readonly redisProvider: RedisClientProvider,
    private readonly indexer: ProductIndexerService,
  ) {}

  onModuleInit(): void {
    if (this.redisProvider.config.enabled) {
      void this.startWorker();
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.workerRunning = false;
    if (this.workerClient) {
      await this.workerClient.quit().catch(() => undefined);
      this.workerClient = null;
    }
  }

  async enqueue(productId: number): Promise<boolean> {
    const client = this.redisProvider.redis;
    if (!this.redisProvider.isReady() || !client) return false;

    const key = `${this.redisProvider.config.keyPrefix}${this.redisProvider.config.indexQueueKey}`;
    try {
      await client.lpush(key, String(productId));
      return true;
    } catch (err) {
      this.logger.warn(`Index enqueue failed: ${(err as Error).message}`);
      return false;
    }
  }

  /** Queue when Redis is up; otherwise index synchronously. */
  async enqueueOrIndex(productId: number): Promise<void> {
    const queued = await this.enqueue(productId);
    if (!queued) {
      await this.indexer.indexProduct(productId);
    }
  }

  private async startWorker(): Promise<void> {
    if (this.workerRunning) return;
    this.workerRunning = true;

    const key = `${this.redisProvider.config.keyPrefix}${this.redisProvider.config.indexQueueKey}`;
    this.logger.log('OpenSearch index queue worker started');

    while (this.workerRunning) {
      if (!this.redisProvider.isReady()) {
        await sleep(2000);
        continue;
      }

      if (!this.workerClient) {
        this.workerClient = this.redisProvider.createDuplicate();
        if (!this.workerClient) {
          await sleep(2000);
          continue;
        }
        try {
          await this.workerClient.connect();
        } catch (err) {
          this.logger.warn(`Index worker Redis connect failed: ${(err as Error).message}`);
          await this.workerClient.quit().catch(() => undefined);
          this.workerClient = null;
          await sleep(2000);
          continue;
        }
      }

      try {
        const result = await this.workerClient.brpop(key, 5);
        if (!result) continue;

        const productId = Number(result[1]);
        if (!Number.isFinite(productId)) continue;

        await this.indexer.indexProduct(productId);
      } catch (err) {
        this.logger.warn(`Index worker error: ${(err as Error).message}`);
        await this.workerClient?.quit().catch(() => undefined);
        this.workerClient = null;
        await sleep(1000);
      }
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
