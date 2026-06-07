import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RedisSessionService } from '../../../../infrastructure/redis/redis-session.service';

export interface RequestWithSession extends Request {
  sessionId: string;
}

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly redisSession: RedisSessionService) {}

  use(req: RequestWithSession, res: Response, next: NextFunction): void {
    const sessionId = (req.headers['x-session-id'] as string | undefined) || uuidv4();
    req.sessionId = sessionId;
    res.setHeader('x-session-id', sessionId);
    void this.redisSession.touch(sessionId);
    next();
  }
}
