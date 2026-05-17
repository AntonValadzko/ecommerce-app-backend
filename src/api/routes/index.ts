import { Router } from 'express';
import type { Repositories } from '../../infrastructure/repositories/index.js';
import { ProductService } from '../../application/services/product.service.js';
import { CategoryService } from '../../application/services/category.service.js';
import { SavedSearchService } from '../../application/services/saved-search.service.js';
import { createProductRoutes } from './product.routes.js';
import { createCategoryRoutes } from './category.routes.js';
import { createSavedSearchRoutes } from './saved-search.routes.js';

export function createApiRouter(repos: Repositories): Router {
  const router = Router();

  const productService = new ProductService(repos);
  const categoryService = new CategoryService(repos);
  const savedSearchService = new SavedSearchService(repos);

  router.use('/products', createProductRoutes(productService));
  router.use('/categories', createCategoryRoutes(categoryService));
  router.use('/saved-searches', createSavedSearchRoutes(savedSearchService));

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}
