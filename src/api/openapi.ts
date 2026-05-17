export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Product Catalog API',
    version: '1.0.0',
    description:
      'E-commerce product catalog with advanced search, multi-faceted filtering, sorting, pagination, and saved searches. Built for high-traffic catalog scenarios with SQLite (repository pattern allows swapping databases).',
  },
  servers: [{ url: '/api/v1', description: 'API v1' }],
  tags: [
    { name: 'Products', description: 'Product listing, search, filters, and details' },
    { name: 'Categories', description: 'Category navigation' },
    { name: 'Saved Searches', description: 'Persist filter combinations per session' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'Service is healthy' } },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products with search, filters, and sorting',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search term' },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', schema: { type: 'integer' } },
          { name: 'brand', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'minRating', in: 'query', schema: { type: 'number', minimum: 1, maximum: 5 } },
          { name: 'inStock', in: 'query', schema: { type: 'boolean' } },
          {
            name: 'sort',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['relevance', 'price_asc', 'price_desc', 'rating', 'popularity', 'newest'],
            },
          },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', enum: [24, 48, 96], default: 24 },
          },
          { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'For infinite scroll' },
          {
            name: 'attributes',
            in: 'query',
            schema: { type: 'string' },
            description: 'JSON object e.g. {"color":["Black","White"]}',
          },
          { name: 'scroll', in: 'query', schema: { type: 'string' }, description: 'Set true for infinite scroll mode' },
        ],
        responses: { '200': { description: 'Paginated product list with SEO meta' } },
      },
    },
    '/products/facets': {
      get: {
        tags: ['Products'],
        summary: 'Get filter facets for current query context',
        responses: { '200': { description: 'Brands, price range, ratings, attributes' } },
      },
    },
    '/products/autocomplete': {
      get: {
        tags: ['Products'],
        summary: 'Search autocomplete suggestions',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Autocomplete suggestions' } },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID with SEO metadata',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Product detail' }, '404': { description: 'Not found' } },
      },
    },
    '/products/slug/{slug}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by slug (SEO-friendly URL)',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Product detail' } },
      },
    },
    '/products/{id}/quick-view': {
      get: {
        tags: ['Products'],
        summary: 'Quick view payload without full page navigation',
        responses: { '200': { description: 'Compact product data' } },
      },
    },
    '/products/{id}/related': {
      get: {
        tags: ['Products'],
        summary: 'Related products in same category',
        responses: { '200': { description: 'Related products list' } },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List all categories',
        responses: { '200': { description: 'Category list' } },
      },
    },
    '/categories/tree': {
      get: {
        tags: ['Categories'],
        summary: 'Category tree for navigation',
        responses: { '200': { description: 'Nested category tree' } },
      },
    },
    '/saved-searches': {
      get: {
        tags: ['Saved Searches'],
        summary: 'List saved searches for session',
        parameters: [{ name: 'x-session-id', in: 'header', schema: { type: 'string' } }],
        responses: { '200': { description: 'Saved searches' } },
      },
      post: {
        tags: ['Saved Searches'],
        summary: 'Save current search/filter combination',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  query: { type: 'object' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Saved search created' } },
      },
    },
    '/saved-searches/{id}': {
      delete: {
        tags: ['Saved Searches'],
        summary: 'Delete a saved search',
        responses: { '204': { description: 'Deleted' } },
      },
    },
  },
} as const;
