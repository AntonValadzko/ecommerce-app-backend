import { CategoryRepository } from './category.repository';

describe('CategoryRepository', () => {
  const typeormRepo = {
    createQueryBuilder: jest.fn(),
    findOneBy: jest.fn(),
  };

  const repository = new CategoryRepository(typeormRepo as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds tree with nested children and orphan roots', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue([
      { id: 1, slug: 'root', name: 'Root', parentId: null, description: '', productCount: 1 },
      { id: 2, slug: 'child', name: 'Child', parentId: 1, description: '', productCount: 2 },
      { id: 3, slug: 'orphan', name: 'Orphan', parentId: 99, description: '', productCount: 0 },
    ]);

    const tree = await repository.getTree();

    expect(tree).toHaveLength(2);
    expect(tree.find((n) => n.id === 1)?.children).toHaveLength(1);
    expect(tree.find((n) => n.id === 3)).toBeDefined();
  });

  it('returns null when category id is missing', async () => {
    typeormRepo.findOneBy.mockResolvedValue(null);

    await expect(repository.findById(404)).resolves.toBeNull();
  });
});
