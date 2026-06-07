import { buildWinstonModuleOptions } from './winston.config';
import { withEnv } from '../../test/env';

describe('buildWinstonModuleOptions', () => {
  it('uses debug level in development', () => {
    withEnv({ NODE_ENV: 'development', LOG_LEVEL: undefined }, () => {
      expect(buildWinstonModuleOptions().level).toBe('debug');
    });
  });

  it('uses info level in production', () => {
    withEnv({ NODE_ENV: 'production', LOG_LEVEL: undefined }, () => {
      expect(buildWinstonModuleOptions().level).toBe('info');
    });
  });

  it('respects explicit LOG_LEVEL', () => {
    withEnv({ LOG_LEVEL: 'warn' }, () => {
      expect(buildWinstonModuleOptions().level).toBe('warn');
    });
  });
});
