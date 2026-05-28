# Product Catalog API

Node.js + TypeScript backend for an e-commerce product catalog built with NestJS. Provides full-text search, multi-faceted filtering, cursor and offset pagination, quick view, SEO metadata, and saved search/filter combinations.

## Features

| Requirement | Implementation |
|-------------|----------------|
| Product listing + pagination | `GET /api/v1/products` with `page`, `limit` (24/48/96) |
| Infinite scroll | Pass `cursor` (`search_after`) from `pagination.nextCursor` |
| Quick view | `GET /api/v1/products/:id/quick-view` |
| Search (name, description, SKU, brand) | OpenSearch via `q` parameter |
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
| Create product | `POST /api/v1/products` (Postgres + OpenSearch index) |
| Update product | `PATCH /api/v1/products/:id` (partial; re-indexes OpenSearch) |

## Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript 5.8 (strict mode)
- **Framework:** NestJS 10 (`@nestjs/core`, `@nestjs/platform-express`)
- **Architecture:** Layered / ports & adapters (domain → application → infrastructure → presentation)
- **Database:** PostgreSQL 16 (via **PgBouncer** connection pooling on port `6432`)
- **Search:** OpenSearch 2.x (faceted list, autocomplete, relevance sort)
- **Cache (ready):** Redis 7 in Docker Compose
- **ORM:** TypeORM 0.3 — entities, migrations (`migrationsRun: true`, `synchronize: false`)
- **Validation:** `class-validator` + `class-transformer` DTOs
- **Docs:** Swagger UI at `/api/docs` via `@nestjs/swagger`
- **Security:** `helmet`, `cors`

## Project Structure

The codebase follows **strict layering**: upper layers depend on abstractions (ports), not on Postgres, OpenSearch, or HTTP details.

```
src/
  main.ts                              Bootstrap (Swagger, global pipes/filters)
  app.module.ts                        Wires DatabaseModule, PersistenceModule, presentation modules

  config/
    configuration.ts                   Port, Postgres, OpenSearch, Redis settings

  domain/                              Core models + repository ports (no framework imports)
    common/
      entity-not-found.error.ts
    products/
      product.model.ts                 Product, ProductQuery, PaginatedResult, etc.
      product.repository.port.ts       IProductRepository (Postgres reads)
      product-search.repository.port.ts IProductSearchRepository (OpenSearch)
      search-cursor.model.ts           search_after cursor shape
    categories/
      category.model.ts
      category.repository.port.ts
    saved-searches/
      saved-search.model.ts
      saved-search.repository.port.ts

  application/                         Use cases (depends on domain ports only)
    products/products.service.ts
    categories/categories.service.ts
    saved-searches/saved-searches.service.ts

  infrastructure/                      Adapters implementing domain ports
    persistence/
      persistence.module.ts            Binds ports → Postgres repositories
      repositories/
        product.repository.ts          TypeORM (detail, quick-view, related)
        category.repository.ts
        saved-search.repository.ts
    search/
      search.module.ts                 OpenSearch client, index, search adapter
      opensearch-product-search.repository.ts
      product-indexer.service.ts       Bulk reindex from Postgres → OpenSearch

  presentation/http/                   HTTP boundary (controllers, DTOs, presenters)
    common/
      middleware/session.middleware.ts
      filters/all-exceptions.filter.ts
      decorators/session-id.decorator.ts
      utils/base-url.ts
    products/
      products.module.ts
      products.controller.ts
      products.presenter.ts            Response envelopes + SEO / JSON-LD
      product-response.types.ts
      dto/
    categories/
      categories.module.ts
      categories.controller.ts
      categories.presenter.ts
    saved-searches/
      saved-searches.module.ts
      saved-searches.controller.ts
      saved-searches.presenter.ts
      dto/

  database/                            Persistence schema (TypeORM)
    database.module.ts                 Postgres via PgBouncer
    bulk-load.service.ts               Demo catalog bulk insert
    cli/bulk-load.ts                   npm run db:seed
    cli/search-reindex.ts              npm run search:reindex
    entities/                          TypeORM entities (schema source of truth)
    mappers/                           Entity → domain model
    migrations/                        PostgresInitial
    data-source.ts                     TypeORM CLI DataSource

docker-compose.yml                     Postgres, PgBouncer, OpenSearch, Redis
dist/                                  Compiled output (gitignored)
```

### Layer responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Domain** | Models, repository interfaces (ports), domain errors |
| **Application** | Use cases, validation of business rules (e.g. page limits), throws `EntityNotFoundError` |
| **Infrastructure** | Postgres + OpenSearch adapters, `PersistenceModule` / `SearchModule` |
| **Presentation** | Routes, DTOs, response shaping, SEO metadata, HTTP middleware |
| **Database** | Entities, migrations, bulk-load CLI |

### Dependency flow

```
Presentation → Application → Domain ← Infrastructure
```

Application services never import TypeORM or Express types.

## Local development with Docker

The API runs on your machine (Node.js). **Postgres, PgBouncer, OpenSearch, and Redis** run in Docker via `docker-compose.yml`.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)
- Node.js 20+
- ~2 GB free RAM (OpenSearch uses 512 MB heap by default)

### Services

| Service | Image | Host port | Used by | Purpose |
|---------|-------|-----------|---------|---------|
| **postgres** | `postgres:16-alpine` | `5432` | Admin/debug only | Primary database |
| **pgbouncer** | `edoburu/pgbouncer` | **`6432`** | **NestJS app** | Connection pooling (`transaction` mode) |
| **opensearch** | `opensearchproject/opensearch:2.11.1` | `9200` | Search adapter | Product list, facets, autocomplete |
| **redis** | `redis:7-alpine` | `6379` | Future use | Reserved for caching |

**Credentials (local only):**

| Setting | Value |
|---------|--------|
| Postgres user / password / database | `catalog` / `catalog` / `catalog` |

The app **must** connect through **PgBouncer** (`DATABASE_PORT=6432`), not directly to Postgres on `5432`, so pooling matches production-style setup.

### Docker commands

```bash
# Start all services in the background
docker compose up -d

# Follow logs
docker compose logs -f

# Service status + health
docker compose ps

# Stop containers (keep data volumes)
docker compose down

# Stop and delete all local data (fresh Postgres + OpenSearch)
docker compose down -v
```

### Verify services are ready

```bash
# PgBouncer → Postgres
docker compose exec postgres pg_isready -U catalog -d catalog

# OpenSearch cluster health (expect status "green" or "yellow")
curl http://localhost:9200/_cluster/health?pretty

# Optional: Redis
docker compose exec redis redis-cli ping
```

OpenSearch can take **30–60 seconds** on first start. Wait until `docker compose ps` shows `healthy` for `postgres` and `opensearch` before running `npm run db:seed`.

### Environment file

```bash
cp .env.example .env
```

Defaults in `.env.example` match `docker-compose.yml`. No changes needed for a standard local setup.

### Data persistence

| Volume | Contents |
|--------|----------|
| `pgdata` | Postgres data (survives `docker compose down`) |
| `osdata` | OpenSearch index data |
| `redisdata` | Redis snapshots |

Run `docker compose down -v` to wipe everything and start clean.

### Optional: direct Postgres access

For SQL debugging (bypass PgBouncer):

```bash
docker compose exec postgres psql -U catalog -d catalog
```

Or from the host: `psql -h localhost -p 5432 -U catalog -d catalog` (password: `catalog`).

### Troubleshooting

| Problem | What to try |
|---------|-------------|
| `Cannot connect to Docker daemon` | Start **Docker Desktop** and wait until it is running |
| `ECONNREFUSED` on port `6432` | `docker compose up -d` and check `docker compose ps` |
| `ECONNREFUSED` on port `9200` | OpenSearch still starting; check `docker compose logs opensearch` |
| OpenSearch exits / OOM | Increase Docker Desktop memory (Settings → Resources) to ≥ 4 GB |
| Port already in use | Stop the conflicting process or change host ports in `docker-compose.yml` |
| Empty search results | Run `npm run db:seed` or `npm run search:reindex` after Postgres has data |
| Schema out of date | `npm run build && npm run db:migrate` (migrations also run on app startup) |

### Local architecture

```
┌─────────────────┐     :6432      ┌────────────┐     ┌──────────┐
│  NestJS API     │ ──────────────►│ PgBouncer  │────►│ Postgres │
│  (npm run dev)  │                └────────────┘     └──────────┘
│  :3000          │
│                 │     :9200      ┌────────────┐
│                 │ ──────────────►│ OpenSearch │
└─────────────────┘                └────────────┘
```

## Quick Start

### 1. Start infrastructure

```bash
docker compose up -d
cp .env.example .env
```

Wait until `docker compose ps` shows **healthy** for `postgres` and `opensearch`.

### 2. Install and load data

```bash
npm install
npm run build
npm run db:seed
```

`db:seed` bulk-loads **~150–380 demo products** (random count per category, 15–38 each) with category-matched Unsplash images, then indexes OpenSearch.

### 3. Run API

```bash
npm run dev
```

- API base: http://localhost:3000/api/v1
- Swagger UI: http://localhost:3000/api/docs

### Reindex search only

```bash
npm run search:reindex
# or recreate index: npm run search:reindex -- --recreate-index
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload (`nest start --watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run production build (`node dist/main`) |
| `npm run lint` | Type-check only (`tsc --noEmit`) |
| `npm run db:migrate` | Run pending migrations (requires `npm run build` first) |
| `npm run db:seed` | Bulk-load demo catalog to Postgres + index OpenSearch |
| `npm run search:reindex` | Rebuild OpenSearch index from Postgres |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP listen port |
| `NODE_ENV` | `development` | Environment name |
| `DATABASE_HOST` | `localhost` | Postgres host (use PgBouncer) |
| `DATABASE_PORT` | `6432` | PgBouncer port |
| `DATABASE_USER` | `catalog` | Database user |
| `DATABASE_PASSWORD` | `catalog` | Database password |
| `DATABASE_NAME` | `catalog` | Database name |
| `OPENSEARCH_NODE` | `http://localhost:9200` | OpenSearch URL |
| `OPENSEARCH_INDEX` | `products` | Product search index name |
| `REDIS_URL` | `redis://localhost:6379` | Redis (reserved for future caching) |

Copy `.env.example` to `.env`. Config is injected via `ConfigService` (`@nestjs/config`).

## API Reference

### Products

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/products` | List with search, filters, sort, pagination |
| GET | `/api/v1/products/facets` | Filter facets for current query context |
| GET | `/api/v1/products/autocomplete?q=` | Autocomplete (products + brands) |
| GET | `/api/v1/products/slug/:slug` | Product by SEO slug |
| GET | `/api/v1/products/:id` | Product by numeric ID |
| GET | `/api/v1/products/:id/quick-view` | Compact data for modal/overlay |
| GET | `/api/v1/products/:id/related` | Related products in same category |
| POST | `/api/v1/products` | Create product (validates category; unique SKU/slug) |
| PATCH | `/api/v1/products/:id` | Partial update; syncs OpenSearch index |

**Query parameters for `/products` and `/products/facets`:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search term |
| `category` | string | Filter by category slug |
| `categoryId` | number | Filter by category ID |
| `brand` | string[] | Filter by brand(s) — repeatable |
| `minPrice` / `maxPrice` | number | Price range |
| `minRating` | number (1–5) | Minimum average rating |
| `inStock` | boolean | In-stock items only |
| `attributes` | JSON string | Attribute filters, e.g. `{"color":["Black"]}` |
| `sort` | enum | `relevance` \| `price_asc` \| `price_desc` \| `rating` \| `popularity` \| `newest` |
| `page` | number | Page number (default: 1) |
| `limit` | 24 \| 48 \| 96 | Items per page (default: 24) |
| `cursor` | string | OpenSearch `search_after` cursor (base64url JSON); use for infinite scroll |

### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/categories` | Flat list with product counts |
| GET | `/api/v1/categories/tree` | Nested tree for navigation |
| GET | `/api/v1/categories/:slug` | Category by slug |

### Saved Searches

Session is identified by the `x-session-id` request header. If omitted, a UUID is generated and echoed back in the response header.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/saved-searches` | List saved searches for current session |
| POST | `/api/v1/saved-searches` | Save a search/filter combination |
| DELETE | `/api/v1/saved-searches/:id` | Delete a saved search |

## API Examples

### List products (page 1, 24 per page)

```http
GET /api/v1/products?limit=24&page=1&sort=popularity
```

### Search with filters

```http
GET /api/v1/products?q=wireless&brand=TechPro&minPrice=50&maxPrice=200&minRating=4&inStock=true&sort=price_asc
```

### Cursor-based infinite scroll

Pass the `nextCursor` value from a previous response as `cursor` (OpenSearch `search_after`, base64url-encoded):

```http
GET /api/v1/products?limit=24&cursor=eyJzb3J0IjoicG9wdWxhcml0eSIsInNlYXJjaEFmdGVyIjpbNTAwMCw0Ml19
```

### Attribute filter

```http
GET /api/v1/products?category=electronics&attributes={"color":["Black","Silver"]}
```

### Autocomplete

```http
GET /api/v1/products/autocomplete?q=wire&limit=5
```

### Save a search

```http
POST /api/v1/saved-searches
Content-Type: application/json
x-session-id: my-session-uuid

{
  "name": "Wireless under $100",
  "query": { "search": "wireless", "maxPrice": 100, "sort": "price_asc" }
}
```

## Key Design Decisions

**Layered architecture:** Domain defines models and repository ports (`IProductRepository`, `IProductSearchRepository`, etc.). `PersistenceModule` and `SearchModule` bind ports to Postgres and OpenSearch adapters. Application and presentation layers stay unchanged when swapping infrastructure.

**DB access:** Postgres is the source of truth via TypeORM (`ProductRepository`, etc.). Search/list/facets/autocomplete use `OpenSearchProductSearchRepository` with `search_after` cursors for stable pagination under index updates. Offset `page` is still supported but less ideal at scale.

**Session:** Stateless, header-based. `x-session-id` is read or generated per request by `SessionMiddleware` and echoed back in the response header.

**Pagination:** Prefer `cursor` (OpenSearch `search_after`, encoded as base64url JSON). Offset `page`/`limit` is supported for shallow pages. Fetches `limit + 1` hits to determine `hasMore`.

**Faceted filtering:** `getFacets` strips brand/price/rating/attribute filters before counting — "open facets" pattern so each dimension shows independent counts.

**OpenSearch:** Custom `product_text` analyzer (porter stem). Relevance sort uses `_score`. Reindex with `npm run search:reindex` after bulk loads or bulk updates.

**SEO:** Built in `ProductsPresenter` (presentation layer). Product detail responses include JSON-LD (`schema.org/Product`), canonical URL, and Open Graph type. Listing responses include `schema.org/ItemList`.

**Errors:** Application throws `EntityNotFoundError`; `AllExceptionsFilter` maps it to HTTP 404. `ValidationPipe` with `whitelist: true` is applied globally.

## Production Notes

Docker Compose is for **local development**. For marketplace-scale production:

- Managed Postgres (Aurora/RDS) + PgBouncer or RDS Proxy
- OpenSearch cluster (multi-AZ) with index lifecycle management
- Redis for facet/query cache and rate limiting
- Async ingest pipeline (Kafka → workers → Postgres → indexer)
- Horizontal API autoscaling; CDN for images and cacheable GETs
