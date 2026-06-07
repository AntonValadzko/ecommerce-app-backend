import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../../../application/categories/categories.service';
import { CategoriesPresenter } from './categories.presenter';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  const categoriesService = {
    getAll: jest.fn(),
    getTree: jest.fn(),
    getBySlug: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        CategoriesPresenter,
        { provide: CategoriesService, useValue: categoriesService },
      ],
    }).compile();

    controller = module.get(CategoriesController);
  });

  it('returns all categories', async () => {
    categoriesService.getAll.mockResolvedValue([{ id: 1 }]);

    await expect(controller.findAll()).resolves.toEqual({ data: [{ id: 1 }] });
  });

  it('returns category tree', async () => {
    categoriesService.getTree.mockResolvedValue([{ id: 1, children: [] }]);

    await expect(controller.getTree()).resolves.toEqual({ data: [{ id: 1, children: [] }] });
  });

  it('returns category by slug', async () => {
    categoriesService.getBySlug.mockResolvedValue({ id: 1, slug: 'phones' });

    await expect(controller.findBySlug('phones')).resolves.toEqual({
      data: { id: 1, slug: 'phones' },
    });
  });
});
