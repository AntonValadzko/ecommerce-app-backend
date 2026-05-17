# Product Catalog API

Node.js + TypeScript backend for an e-commerce product catalog with advanced search, multi-faceted filtering, sorting, pagination (including infinite scroll), quick view, SEO metadata, and saved search/filter combinations.

## Features

| Requirement | Implementation |
|-------------|----------------|
| Product listing + pagination | `GET /api/v1/products` with `page`, `limit` (24/48/96) |
| Infinite scroll | Pass `cursor` from `pagination.nextCursor`, or `scroll=true` |
| Quick view | `GET /api/v1/products/:id/quick-view` |
| Search (name, description, SKU, brand) | SQLite FTS5 via `q` parameter |
| Autocomplete | `GET /api/v1/products/autocomplete?q=` |
| Price range filter | `minPrice`, `maxPrice` |
| Multi-select brand | `brand=BrandA&brand=BrandB` |
| Rating filter | `minRating=4` (4+ stars) |
| Category navigation | `category` (slug) or `categoryId` |
| Product attributes | `attributes={"color":["Black"]}` (JSON string) |
| Sorting | `sort=relevance\|price_asc\|price_desc\|rating\|popularity\|newest` |
| Filter facets | `GET /api/v1/products/facets` |
| SEO metadata | Included in product/list responses under `meta.seo` |
| Saved searches | `POST/GET/DELETE /api/v1/saved-searches` (session-based) |
| Related products | `GET /api/v1/products/:id/related` |

## Architecture

```
src/
├── domain/           # Entities + repository interfaces (DB-agnostic)
├── application/      # Business services
├── infrastructure/   # SQLite implementations, migrations, seed
├── api/              # Routes, validation, OpenAPI, middleware
└── config/
```

**Repository pattern:** `IProductRepository`, `ICategoryRepository`, and `ISavedSearchRepository` live in `domain/repositories/`. SQLite implementations are in `infrastructure/repositories/`. To switch to PostgreSQL or another database, add new repository classes and wire them in `createRepositories()`.

## Quick Start

### Backend (port 3000)

```bash
npm install
npm run dev
```

On first start, migrations run automatically and **100 products across 10 categories** are seeded.

- API: http://localhost:3000/api/v1
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs.json

### Frontend (port 3001)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3001 — see [frontend/README.md](frontend/README.md) for details.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run db:migrate` | Run migrations only |
| `npm run db:seed` | Re-seed database (resets products) |

## API Examples

### List products (page 1, 24 per page)

```http
GET /api/v1/products?limit=24&page=1&sort=popularity
```

### Search with filters

```http
GET /api/v1/products?q=wireless&brand=TechPro&minPrice=50&maxPrice=200&minRating=4&inStock=true&sort=price_asc
```

### Infinite scroll

```http
GET /api/v1/products?limit=24&cursor=eyJvZmZzZXQiOjI0fQ
```

### Attribute filter

```http
GET /api/v1/products?category=electronics&attributes={"color":["Black","Silver"]}
```

### Autocomplete

```http
GET /api/v1/products/autocomplete?q=wire
```

### Save search (use `x-session-id` header)

```http
POST /api/v1/saved-searches
Content-Type: application/json
x-session-id: my-session-123

{
  "name": "Wireless under $100",
  "query": { "q": "wireless", "maxPrice": 100, "sort": "price_asc" }
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DB_PATH` | `./data/catalog.db` | SQLite file path |
| `NODE_ENV` | `development` | Environment |

## Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript (strict)
- **HTTP:** Express
- **Database:** SQLite (better-sqlite3) + FTS5 full-text search
- **Validation:** Zod
- **Docs:** Swagger UI + OpenAPI 3.0
- **Security:** Helmet, CORS

## Production Notes

This backend is designed with large-scale catalog requirements in mind. For production at 10M+ products and sub-200ms search:

- Replace SQLite with PostgreSQL + Elasticsearch/OpenSearch
- Implement the same repository interfaces with new adapters
- Add Redis caching for facets and popular queries
- Use read replicas and CDN for product images

The current SQLite + FTS5 setup is ideal for development, demos, and integration testing.
