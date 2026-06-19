import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';
import { RedisClientProvider } from '../../../infrastructure/redis/redis.client';
import { OpenSearchClientProvider } from '../../../infrastructure/search/opensearch.client';

describe('HealthController', () => {
  const dataSource = { query: jest.fn() };
  const redis = {
    config: { enabled: true },
    ping: jest.fn(),
  };
  const opensearch = {
    enabled: true,
    client: {
      cluster: {
        health: jest.fn(),
      },
    },
  };

  async function createController(nodeEnv: string) {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: DataSource, useValue: dataSource },
        { provide: RedisClientProvider, useValue: redis },
        { provide: OpenSearchClientProvider, useValue: opensearch },
        {
          provide: ConfigService,
          useValue: { get: (key: string) => (key === 'nodeEnv' ? nodeEnv : undefined) },
        },
      ],
    }).compile();

    return module.get(HealthController);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    redis.config.enabled = true;
  });

  it('returns ok when postgres and opensearch are healthy', async () => {
    const controller = await createController('development');
    dataSource.query.mockResolvedValue([{ '?column?': 1 }]);
    redis.ping.mockResolvedValue(true);
    opensearch.client.cluster.health.mockResolvedValue({ body: { status: 'green' } });

    await expect(controller.check()).resolves.toEqual({
      status: 'ok',
      checks: {
        postgres: expect.objectContaining({ ok: true, latencyMs: expect.any(Number) }),
        redis: { ok: true, enabled: true },
        opensearch: { ok: true, enabled: true },
      },
    });
  });

  it('returns degraded when postgres fails', async () => {
    const controller = await createController('development');
    dataSource.query.mockRejectedValue(new Error('password authentication failed'));
    redis.ping.mockResolvedValue(true);
    opensearch.client.cluster.health.mockResolvedValue({ body: { status: 'green' } });

    const result = await controller.check();

    expect(result.status).toBe('degraded');
    expect(result.checks.postgres.error).toBe('password authentication failed');
  });

  it('skips opensearch check when disabled', async () => {
    opensearch.enabled = false;
    opensearch.client = null as never;
    const controller = await createController('development');
    dataSource.query.mockResolvedValue([{ '?column?': 1 }]);
    redis.config.enabled = false;

    const result = await controller.check();

    expect(result.checks.opensearch).toEqual({ ok: true, enabled: false });
    opensearch.enabled = true;
    opensearch.client = { cluster: { health: jest.fn() } } as never;
  });

  it('masks dependency errors in production', async () => {
    const controller = await createController('production');
    dataSource.query.mockRejectedValue(new Error('password authentication failed'));
    redis.config.enabled = false;
    opensearch.client.cluster.health.mockRejectedValue(new Error('connection refused'));

    const result = await controller.check();

    expect(result.checks.postgres.error).toBe('unavailable');
    expect(result.checks.opensearch.error).toBe('unavailable');
  });
});
