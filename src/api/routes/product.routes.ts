import { Router } from 'express';
import type { ProductService } from '../../application/services/product.service.js';
import { AppError, asyncHandler } from '../middleware/error-handler.js';
import {
  autocompleteQuerySchema,
  productListQuerySchema,
  toProductQuery,
} from '../schemas/product.schemas.js';

export function createProductRoutes(productService: ProductService): Router {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const parsed = productListQuerySchema.parse(req.query);
      const query = toProductQuery(parsed);
      const result = await productService.listProducts(query);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const seo = productService.buildListingSeo(query, result.total, baseUrl);

      res.json({
        data: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
        },
        meta: {
          sort: parsed.sort,
          pageSizeOptions: [24, 48, 96],
          infiniteScroll: Boolean(parsed.cursor || req.query.scroll === 'true'),
          seo,
        },
      });
    })
  );

  router.get(
    '/facets',
    asyncHandler(async (req, res) => {
      const parsed = productListQuerySchema.parse(req.query);
      const facets = await productService.getFacets(toProductQuery(parsed));
      res.json({ data: facets });
    })
  );

  router.get(
    '/autocomplete',
    asyncHandler(async (req, res) => {
      const { q } = autocompleteQuerySchema.parse(req.query);
      const suggestions = await productService.autocomplete(q);
      res.json({ data: suggestions });
    })
  );

  router.get(
    '/slug/:slug',
    asyncHandler(async (req, res) => {
      const product = await productService.getProductBySlug(String(req.params.slug));
      if (!product) throw new AppError(404, 'Product not found');

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const seo = productService.buildProductSeo(product, baseUrl);

      res.json({ data: product, meta: { seo } });
    })
  );

  router.get(
    '/:id/quick-view',
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) throw new AppError(400, 'Invalid product ID');

      const product = await productService.getQuickView(id);
      if (!product) throw new AppError(404, 'Product not found');

      res.json({ data: product });
    })
  );

  router.get(
    '/:id/related',
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) throw new AppError(400, 'Invalid product ID');

      const related = await productService.getRelatedProducts(id);
      res.json({ data: related });
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) throw new AppError(400, 'Invalid product ID');

      const product = await productService.getProduct(id);
      if (!product) throw new AppError(404, 'Product not found');

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const seo = productService.buildProductSeo(product, baseUrl);

      res.json({ data: product, meta: { seo } });
    })
  );

  return router;
}
