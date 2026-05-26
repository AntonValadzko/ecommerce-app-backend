import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithSession } from '../middleware/session.middleware';

export const SessionId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithSession>();
    return request.sessionId;
  },
);
