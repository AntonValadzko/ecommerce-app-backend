import { Router } from 'express';
import type { SavedSearchService } from '../../application/services/saved-search.service.js';
import { AppError, asyncHandler } from '../middleware/error-handler.js';
import { savedSearchBodySchema } from '../schemas/product.schemas.js';
import type { ProductQuery } from '../../domain/entities/product.js';

export function createSavedSearchRoutes(savedSearchService: SavedSearchService): Router {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const searches = await savedSearchService.list(req.sessionId);
      res.json({ data: searches });
    })
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const body = savedSearchBodySchema.parse(req.body);
      const saved = await savedSearchService.save(
        req.sessionId,
        body.name,
        body.query as ProductQuery
      );
      res.status(201).json({ data: saved });
    })
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const deleted = await savedSearchService.remove(String(req.params.id), req.sessionId);
      if (!deleted) throw new AppError(404, 'Saved search not found');
      res.status(204).send();
    })
  );

  return router;
}
