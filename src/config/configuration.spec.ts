import configuration from './configuration';
import { withEnv } from '../test/env';

describe('configuration', () => {
  it('uses defaults when env is unset', () => {
    withEnv(
      {
        PORT: undefined,
        NODE_ENV: undefined,
        DATABASE_HOST: undefined,
        DATABASE_PASSWORD: undefined,
        REDIS_ENABLED: undefined,
        SWAGGER_ENABLED: undefined,
      },
      () => {
        const config = configuration();

        expect(config.port).toBe(3000);
        expect(config.nodeEnv).toBe('development');
        expect(config.logLevel).toBe('debug');
        expect(config.swaggerEnabled).toBe(true);
        expect(config.database.password).toBe('catalog');
        expect(config.redis.enabled).toBe(true);
        expect(config.defaultPageSize).toBe(24);
      },
    );
  });

  it('sets production log level and disables swagger by default', () => {
    withEnv({ NODE_ENV: 'production', SWAGGER_ENABLED: undefined, LOG_LEVEL: undefined }, () => {
      const config = configuration();

      expect(config.logLevel).toBe('info');
      expect(config.swaggerEnabled).toBe(false);
    });
  });

  it('enables swagger in production when SWAGGER_ENABLED=true', () => {
    withEnv({ NODE_ENV: 'production', SWAGGER_ENABLED: 'true' }, () => {
      expect(configuration().swaggerEnabled).toBe(true);
    });
  });

  it('disables redis when REDIS_ENABLED=false', () => {
    withEnv({ REDIS_ENABLED: 'false' }, () => {
      expect(configuration().redis.enabled).toBe(false);
    });
  });

  it('falls back numeric env values when invalid', () => {
    withEnv({ PORT: 'abc', REDIS_RATE_LIMIT_MAX: 'nope' }, () => {
      const config = configuration();

      expect(config.port).toBe(3000);
      expect(config.redis.rateLimit.maxRequests).toBe(200);
    });
  });
});
