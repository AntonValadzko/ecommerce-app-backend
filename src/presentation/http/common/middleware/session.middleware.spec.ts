import { Test, TestingModule } from '@nestjs/testing';
import { SessionMiddleware, type RequestWithSession } from './session.middleware';
import { RedisSessionService } from '../../../../infrastructure/redis/redis-session.service';

describe('SessionMiddleware', () => {
  let middleware: SessionMiddleware;
  const redisSession = { touch: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionMiddleware,
        { provide: RedisSessionService, useValue: redisSession },
      ],
    }).compile();

    middleware = module.get(SessionMiddleware);
  });

  it('reuses x-session-id header when provided', () => {
    const req = { headers: { 'x-session-id': 'existing-session' }, sessionId: '' } as unknown as RequestWithSession;
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res as never, next);

    expect(req.sessionId).toBe('existing-session');
    expect(res.setHeader).toHaveBeenCalledWith('x-session-id', 'existing-session');
    expect(redisSession.touch).toHaveBeenCalledWith('existing-session');
    expect(next).toHaveBeenCalled();
  });

  it('generates session id when header is missing', () => {
    const req = { headers: {}, sessionId: '' } as unknown as RequestWithSession;
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res as never, next);

    expect(req.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(next).toHaveBeenCalled();
  });
});
