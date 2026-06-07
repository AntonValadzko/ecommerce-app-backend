import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { RedisClientProvider } from '../../../infrastructure/redis/redis.client';
import { OpenSearchClientProvider } from '../../../infrastructure/search/opensearch.client';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly dataSource: DataSource,
    private readonly redis: RedisClientProvider,
    private readonly opensearch: OpenSearchClientProvider,
    configService: ConfigService,
  ) {
    this.isProduction = configService.get<string>('nodeEnv') === 'production';
  }

  @Get()
  @ApiOperation({ summary: 'Service health (Postgres, Redis, OpenSearch)' })
  async check() {
    const [postgres, redis, opensearch] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
      this.checkOpenSearch(),
    ]);

    const ok = postgres.ok && opensearch.ok;
    return {
      status: ok ? 'ok' : 'degraded',
      checks: { postgres, redis, opensearch },
    };
  }

  private async checkPostgres(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
    const start = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      return { ok: true, latencyMs: Date.now() - start };
    } catch (err) {
      return { ok: false, error: this.publicError((err as Error).message) };
    }
  }

  private async checkRedis(): Promise<{ ok: boolean; enabled: boolean; error?: string }> {
    if (!this.redis.config.enabled) {
      return { ok: true, enabled: false };
    }
    const ok = await this.redis.ping();
    return ok ? { ok: true, enabled: true } : { ok: false, enabled: true, error: 'ping failed' };
  }

  private async checkOpenSearch(): Promise<{ ok: boolean; error?: string }> {
    try {
      const health = await this.opensearch.client.cluster.health();
      const status = health.body.status as string;
      const ok = status !== 'red';
      return ok
        ? { ok: true }
        : { ok: false, error: this.publicError(`cluster status: ${status}`) };
    } catch (err) {
      return { ok: false, error: this.publicError((err as Error).message) };
    }
  }

  private publicError(message: string): string {
    return this.isProduction ? 'unavailable' : message;
  }
}
