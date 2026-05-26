import type { Request } from 'express';

export function getBaseUrl(req: Request): string {
  return `${req.protocol}://${req.get('host')}`;
}
