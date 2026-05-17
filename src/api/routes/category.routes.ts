import { Router } from 'express';
import type { CategoryService } from '../../application/services/category.service.js';
import { AppError, asyncHandler } from '../middleware/error-handler.js';

export function createCategoryRoutes(categoryService: CategoryService): Router {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const categories = await categoryService.getAll();
      res.json({ data: categories });
    })
  );

  router.get(
    '/tree',
    asyncHandler(async (_req, res) => {
      const tree = await categoryService.getTree();
      res.json({ data: tree });
    })
  );

  router.get(
    '/:slug',
    asyncHandler(async (req, res) => {
      const slug = String(req.params.slug);
      const category = await categoryService.getBySlug(slug);
      if (!category) throw new AppError(404, 'Category not found');
      res.json({ data: category });
    })
  );

  return router;
}
