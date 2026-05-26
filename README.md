# Product Catalog API

Node.js + TypeScript backend for an e-commerce product catalog built with NestJS. Provides full-text search, multi-faceted filtering, cursor and offset pagination, quick view, SEO metadata, and saved search/filter combinations.

## Features

| Requirement | Implementation |
|-------------|----------------|
| Product listing + pagination | `GET /api/v1/products` with `page`, `limit` (24/48/96) |
| Infinite scroll | Pass `cursor` from `pagination.nextCursor` |
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

## Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript 5.8 (strict mode)
- **Framework:** NestJS 10 (`@nestjs/core`, `@nestjs/platform-express`)
- **Architecture:** Layered / ports & adapters (domain → application → infrastructure → presentation)
- **Database:** SQLite via `better-sqlite3`, configured through TypeORM
- **ORM:** TypeORM 0.3 — entities, migrations (`migrationsRun: true`, `synchronize: false`)
- **Validation:** `class-validator` + `class-transformer` DTOs
- **Docs:** Swagger UI at `/api/docs` via `@nestjs/swagger`
- **Security:** `helmet`, `cors`

## Project Structure

The codebase follows **strict layering**: upper layers depend on abstractions (ports), not on SQLite or HTTP details.

```
src/
  main.ts                              Bootstrap (Swagger, global pipes/filters)
  app.module.ts                        Wires DatabaseModule, PersistenceModule, presentation modules

  config/
    configuration.ts                   Port, dbPath, page size limits

  domain/                              Core models + repository ports (no framework imports)
    common/
      entity-not-found.error.ts
    products/
      product.model.ts                 Product, ProductQuery, PaginatedResult, etc.
      product.repository.port.ts       IProductRepository + PRODUCT_REPOSITORY token
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
      persistence.module.ts            Binds ports → repository implementations
      repositories/
        product.repository.ts          TypeORM (reads, related products)
        product-search.repository.ts   Raw SQL — FTS5, facets, list, autocomplete
        category.repository.ts
        saved-search.repository.ts

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
    database.module.ts                 forRootAsync + seed on init
    database.constants.ts
    entities/                          TypeORM entities (source of truth for schema)
    mappers/                           Entity → domain model mappers
    migrations/                        InitialSchema, Fts5
    seed.ts
    sqlite-base.repository.ts          Base for FTS-only raw SQL access
    data-source.ts                     Standalone DataSource for TypeORM CLI

data/                                  SQLite DB file (gitignored)
dist/                                  Compiled output (gitignored)
```

### Layer responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Domain** | Models, repository interfaces (ports), domain errors |
| **Application** | Use cases, validation of business rules (e.g. page limits), throws `EntityNotFoundError` |
| **Infrastructure** | TypeORM repositories, SQLite FTS search, port bindings in `PersistenceModule` |
| **Presentation** | Routes, DTOs, response shaping, SEO metadata, HTTP middleware |
| **Database** | Entities, migrations, seed — shared schema definition |

### Dependency flow

```
Presentation → Application → Domain ← Infrastructure
```

Application services never import TypeORM, SQLite, or Express types.

## Quick Start

```bash
npm install
npm run dev
```

On first start, migrations run automatically and **100 products across 10 categories** are seeded into a fresh database.

- API base: http://localhost:3000/api/v1
- Swagger UI: http://localhost:3000/api/docs

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload (`nest start --watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run production build (`node dist/main`) |
| `npm run lint` | Type-check only (`tsc --noEmit`) |
| `npm run db:migrate` | Run pending migrations (requires `npm run build` first) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP listen port |
| `NODE_ENV` | `development` | Environment name |
| `DB_PATH` | `<cwd>/data/catalog.db` | SQLite database file path |

No `.env` file is committed. Config is injected via `ConfigService` (`@nestjs/config`).

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
| `cursor` | string | Base64url cursor for cursor-based pagination |

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

Pass the `nextCursor` value from a previous response as `cursor`:

```http
GET /api/v1/products?limit=24&cursor=eyJvZmZzZXQiOjI0fQ
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

**Layered architecture:** Domain defines models and `IProductRepository` / `ICategoryRepository` / `ISavedSearchRepository` ports. `PersistenceModule` binds each port to a concrete adapter. Swapping the database means replacing infrastructure (and migrations), not application or presentation code.

**DB access:** TypeORM entities are the schema source of truth. Standard reads/writes use TypeORM repositories with entity→domain mappers. FTS5 search, faceted counts, and filtered listing use `ProductSearchRepository` (raw SQL via `SqliteBaseRepository`) because FTS virtual tables are SQLite-specific.

**Session:** Stateless, header-based. `x-session-id` is read or generated per request by `SessionMiddleware` and echoed back in the response header.

**Pagination:** Supports both offset (`page`/`limit`) and cursor (`cursor` = base64url-encoded `{offset}`). Fetches `limit + 1` rows to determine `hasMore`.

**Faceted filtering:** `getFacets` strips brand/price/rating/attribute filters before counting — "open facets" pattern so each dimension shows independent counts.

**FTS5:** Porter stemmer + unicode61 tokenizer. BM25 ranking for relevance sort. Triggers keep `products_fts` in sync with `products`.

**SEO:** Built in `ProductsPresenter` (presentation layer). Product detail responses include JSON-LD (`schema.org/Product`), canonical URL, and Open Graph type. Listing responses include `schema.org/ItemList`.

**Errors:** Application throws `EntityNotFoundError`; `AllExceptionsFilter` maps it to HTTP 404. `ValidationPipe` with `whitelist: true` is applied globally.

## Swapping the Database

To migrate off SQLite (e.g. PostgreSQL + OpenSearch):

1. Update `DatabaseModule` connection config and add new migrations.
2. Implement new repository adapters under `infrastructure/persistence/repositories/`.
3. Reimplement or replace `ProductSearchRepository` (FTS5 is not portable).
4. Point `PersistenceModule` at the new implementations.
5. Leave `domain/`, `application/`, and `presentation/` unchanged if ports stay the same.

## Production Notes

The SQLite + FTS5 setup is suited for development, demos, and single-server deployments. For large-scale production:

- Replace SQLite with PostgreSQL + Elasticsearch/OpenSearch
- Add Redis caching for facets and popular queries
- Use read replicas and a CDN for product images
