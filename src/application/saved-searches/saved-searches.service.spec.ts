import { Test, TestingModule } from '@nestjs/testing';
import { SavedSearchesService } from './saved-searches.service';
import { SAVED_SEARCH_REPOSITORY } from '../../domain/saved-searches/saved-search.repository.port';
import { EntityNotFoundError } from '../../domain/common/entity-not-found.error';

describe('SavedSearchesService', () => {
  let service: SavedSearchesService;
  const savedSearchRepo = {
    findBySession: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SavedSearchesService, { provide: SAVED_SEARCH_REPOSITORY, useValue: savedSearchRepo }],
    }).compile();

    service = module.get(SavedSearchesService);
  });

  it('lists saved searches for session', async () => {
    savedSearchRepo.findBySession.mockResolvedValue([{ id: '1' }]);

    await expect(service.list('session-1')).resolves.toEqual([{ id: '1' }]);
  });

  it('throws when delete misses', async () => {
    savedSearchRepo.delete.mockResolvedValue(false);

    await expect(service.remove('missing', 'session-1')).rejects.toThrow(EntityNotFoundError);
  });
});
