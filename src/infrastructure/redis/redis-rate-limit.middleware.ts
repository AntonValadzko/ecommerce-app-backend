import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisClientProvider } from './redis.client';

@Injectable()
export class RedisRateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RedisRateLimitMiddleware.name);

  constructor(private readonly redisProvider: RedisClientProvider) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!this.redisProvider.isReady() || !this.redisProvider.redis) {
      return next();
    }

    const { windowSec, maxRequests } = this.redisProvider.config.rateLimit;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const bucket = `rate:${ip}:${req.method}:${req.baseUrl || req.path}`;
    const key = `${this.redisProvider.config.keyPrefix}${bucket}`;

    try {
      const client = this.redisProvider.redis;
      const count = await client.incr(key);
      if (count === 1) {
        await client.expire(key, windowSec);
      }

      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - count)));

      if (count > maxRequests) {
        res.setHeader('Retry-After', String(windowSec));
        throw new HttpException(
          { statusCode: HttpStatus.TOO_MANY_REQUESTS, message: 'Rate limit exceeded' },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.warn(`Rate limit skipped: ${(err as Error).message}`);
    }

    next();
  }
}
