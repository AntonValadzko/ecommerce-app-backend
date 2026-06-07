import { utilities as nestWinstonUtilities, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

export function buildWinstonModuleOptions(): WinstonModuleOptions {
  const level = process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug');

  return {
    level,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.errors({ stack: true }),
          nestWinstonUtilities.format.nestLike('CatalogApi', {
            colors: !isProduction,
            prettyPrint: !isProduction,
          }),
        ),
      }),
    ],
  };
}

/** Standalone Winston logger for CLI scripts (outside Nest HTTP context). */
export function createCliLogger(context: string): winston.Logger {
  const options = buildWinstonModuleOptions();
  return winston.createLogger({
    level: options.level,
    defaultMeta: { context },
    transports: options.transports,
  });
}
