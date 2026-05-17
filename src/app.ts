import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { createApiRouter } from './api/routes/index.js';
import { openApiSpec } from './api/openapi.js';
import { errorHandler } from './api/middleware/error-handler.js';
import { sessionMiddleware } from './api/middleware/session.js';
import { createRepositories } from './infrastructure/repositories/index.js';

export function createApp() {
  const app = express();
  const repos = createRepositories();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(sessionMiddleware);

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customSiteTitle: 'Product Catalog API Docs',
  }));

  app.get('/api/docs.json', (_req, res) => {
    res.json(openApiSpec);
  });

  app.use('/api/v1', createApiRouter(repos));

  app.get('/', (_req, res) => {
    res.json({
      name: 'Product Catalog API',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/api/v1/health',
    });
  });

  app.use(errorHandler);

  return app;
}
