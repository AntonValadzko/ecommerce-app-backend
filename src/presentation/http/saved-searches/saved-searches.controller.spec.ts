import { Test, TestingModule } from '@nestjs/testing';
import { SavedSearchesController } from './saved-searches.controller';
import { SavedSearchesService } from '../../../application/saved-searches/saved-searches.service';
import { SavedSearchesPresenter } from './saved-searches.presenter';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { SavedProductQueryDto } from './dto/product-query.dto';

describe('SavedSearchesController', () => {
  let controller: SavedSearchesController;
  const savedSearchesService = {
    list: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedSearchesController],
      providers: [
        SavedSearchesPresenter,
        { provide: SavedSearchesService, useValue: savedSearchesService },
      ],
    }).compile();

    controller = module.get(SavedSearchesController);
  });

  it('lists saved searches for session', async () => {
    savedSearchesService.list.mockResolvedValue([{ id: '1' }]);

    await expect(controller.findAll('session-1')).resolves.toEqual({ data: [{ id: '1' }] });
  });

  it('creates saved search', async () => {
    const dto = new CreateSavedSearchDto();
    dto.name = 'Phones';
    const query = new SavedProductQueryDto();
    query.search = 'phone';
    dto.query = query;
    savedSearchesService.save.mockResolvedValue({ id: '1', name: 'Phones' });

    await expect(controller.create('session-1', dto)).resolves.toEqual({
      data: { id: '1', name: 'Phones' },
    });
  });

  it('removes saved search', async () => {
    savedSearchesService.remove.mockResolvedValue(undefined);

    await expect(controller.remove('search-1', 'session-1')).resolves.toBeUndefined();
    expect(savedSearchesService.remove).toHaveBeenCalledWith('search-1', 'session-1');
  });
});
