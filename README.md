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
- **Database:** SQLite via `better-sqlite3`, accessed through TypeORM's DataSource driver
- **ORM:** TypeORM 0.3 — migrations only (`migrationsRun: true`, `synchronize: false`)
- **Validation:** `class-validator` + `class-transformer` DTOs
- **Docs:** Swagger UI at `/api/docs` via `@nestjs/swagger`
- **Security:** `helmet`, `cors`

## Project Structure

```
src/
  main.ts                          Bootstrap (NestFactory, Swagger, global pipes/filters)
  app.module.ts                    Root module (ConfigModule, DatabaseModule, feature modules)
  config/
    configuration.ts               ConfigModule factory (port, dbPath, page size limits)
  common/
    middleware/session.middleware.ts  NestMiddleware — x-session-id header handling
    filters/all-exceptions.filter.ts  @Catch() — maps exceptions to HTTP responses
    decorators/session-id.decorator.ts  @SessionId() param decorator
  database/
    database.module.ts             @Global TypeOrmModule.forRootAsync + seed on init
    database.constants.ts          Shared entity and migration arrays
    sqlite-base.repository.ts      Abstract base repository with better-sqlite3 accessor
    entities/                      TypeORM entities (category, product, product-attribute, saved-search)
    migrations/                    Raw SQL migrations (InitialSchema, Fts5)
    seed.ts                        Seed function (runs automatically when products table is empty)
    data-source.ts                 Standalone DataSource for TypeORM CLI
  products/
    products.module.ts
    products.controller.ts         7 GET routes
    products.service.ts            Business logic + SEO builders + limit normalization
    product.types.ts               Interfaces: Product, ProductListItem, ProductQuery, etc.
    dto/
      product-list-query.dto.ts    class-validator DTO with @Transform decorators
      autocomplete-query.dto.ts
    repositories/
      product.repository.ts        Raw SQL via better-sqlite3 (FTS5, facets, cursor pagination)
  categories/
    categories.module.ts
    categories.controller.ts
    categories.service.ts
    category.types.ts
    repositories/
      category.repository.ts
  saved-searches/
    saved-searches.module.ts
    saved-searches.controller.ts
    saved-searches.service.ts
    saved-search.types.ts
    dto/
      create-saved-search.dto.ts
      product-query.dto.ts         Validated ProductQuery shape for nested validation
    repositories/
      saved-search.repository.ts
data/                              SQLite DB file (gitignored)
dist/                              Compiled output (gitignored)
```

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

**DB access:** TypeORM's `DataSource` is used only for migrations and DI. All queries go through `better-sqlite3` prepared statements accessed via a shared `SqliteBaseRepository` base class, preserving named SQL params (`@param` syntax) and synchronous execution.

**Session:** Stateless, header-based. `x-session-id` is read or generated per request by `SessionMiddleware` and echoed back in the response header.

**Pagination:** Supports both offset (`page`/`limit`) and cursor (`cursor` = base64url-encoded `{offset}`) simultaneously. Fetches `limit + 1` rows to determine `hasMore`.

**Faceted filtering:** `getFacets` strips brand/price/rating/attribute filters before counting — "open facets" pattern so each dimension shows independent counts.

**FTS5:** Porter stemmer + unicode61 tokenizer. BM25 ranking for relevance sort. Triggers keep `products_fts` in sync with `products`.

**SEO:** Product detail responses include JSON-LD (`schema.org/Product`), canonical URL, and Open Graph type. Listing responses include `schema.org/ItemList`.

## Production Notes

The SQLite + FTS5 setup is suited for development, demos, and single-server deployments. For large-scale production:

- Replace SQLite with PostgreSQL + Elasticsearch/OpenSearch
- Add Redis caching for facets and popular queries
- Use read replicas and a CDN for product images
