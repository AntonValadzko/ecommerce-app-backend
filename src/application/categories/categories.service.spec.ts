import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CATEGORY_REPOSITORY } from '../../domain/categories/category.repository.port';
import { EntityNotFoundError } from '../../domain/common/entity-not-found.error';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const categoryRepo = {
    findAll: jest.fn(),
    getTree: jest.fn(),
    findBySlug: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, { provide: CATEGORY_REPOSITORY, useValue: categoryRepo }],
    }).compile();

    service = module.get(CategoriesService);
  });

  it('delegates getAll to repository', async () => {
    categoryRepo.findAll.mockResolvedValue([{ id: 1 }]);

    await expect(service.getAll()).resolves.toEqual([{ id: 1 }]);
  });

  it('throws when category slug is missing', async () => {
    categoryRepo.findBySlug.mockResolvedValue(null);

    await expect(service.getBySlug('missing')).rejects.toThrow(EntityNotFoundError);
  });
});
