import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const SESSION_HEADER = 'x-session-id';

declare global {
  namespace Express {
    interface Request {
      sessionId: string;
    }
  }
}

export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existing = req.header(SESSION_HEADER);
  const sessionId = existing && existing.length > 0 ? existing : uuidv4();

  req.sessionId = sessionId;
  res.setHeader(SESSION_HEADER, sessionId);
  next();
}
