# E-Commerce Catalog Backend

A product catalog REST API built with NestJS and TypeScript, backed by SQLite. Provides full-text search, faceted filtering, cursor pagination, and SEO metadata for a frontend storefront.

## Tech Stack

- **Runtime:** Node.js >= 20
- **Language:** TypeScript 5.8 (strict mode, CommonJS modules)
- **Framework:** NestJS 11 (`@nestjs/core`, `@nestjs/platform-express`)
- **Database:** SQLite via `better-sqlite3` (accessed directly through TypeORM's DataSource driver)
- **ORM:** TypeORM 0.3 with `migrationsRun: true`, `synchronize: false`
- **Validation:** `class-validator` + `class-transformer` DTOs
- **Docs:** Swagger UI at `/api/docs` via `@nestjs/swagger`
- **Security:** `helmet`, `cors`

## Project Structure

```
src/
  main.ts                          Bootstrap (NestFactory, Swagger, global pipes/filters)
  app.module.ts                    Root module (ConfigModule, DatabaseModule, feature modules)
  config/
    configuration.ts               ConfigModule factory (port, dbPath, limits)
  common/
    middleware/session.middleware.ts  NestMiddleware — x-session-id header handling
    filters/all-exceptions.filter.ts  @Catch() — maps exceptions to HTTP responses
    decorators/session-id.decorator.ts  @SessionId() param decorator
  database/
    database.module.ts             @Global TypeOrmModule.forRootAsync + seed on init
    entities/                      TypeORM entities (category, product, product-attribute, saved-search)
    migrations/                    Raw SQL migrations (InitialSchema, Fts5)
    seed.ts                        Seed function using better-sqlite3 directly
    data-source.ts                 Standalone DataSource for TypeORM CLI
  products/
    products.module.ts
    products.controller.ts         7 GET routes (order: /, /facets, /autocomplete, /slug/:slug, /:id/quick-view, /:id/related, /:id)
    products.service.ts            Business logic + SEO builders + limit normalization
    product.types.ts               Interfaces: Product, ProductListItem, ProductQuery, etc.
    dto/
      product-list-query.dto.ts    class-validator DTO with @Transform decorators; toProductQuery()
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
    repositories/
      saved-search.repository.ts
data/                              SQLite DB file (gitignored)
dist/                              Compiled output (gitignored)
```

## Development Commands

```bash
npm run dev        # nest start --watch — hot reload dev server
npm run build      # nest build — compile to dist/
npm run start      # node dist/main — run production build
npm run lint       # tsc --noEmit — type-check only
```

No test framework is configured.

## Environment Variables

| Variable  | Default                  | Description              |
|-----------|--------------------------|--------------------------|
| `PORT`    | `3000`                   | HTTP listen port         |
| `NODE_ENV`| `development`            | Environment name         |
| `DB_PATH` | `<cwd>/data/catalog.db`  | SQLite database file path|

No `.env` file is committed. Config is injected via `ConfigService` (NestJS `@nestjs/config`).

## API

Base path: `/api/v1`

### Products

| Method | Path                         | Description                                      |
|--------|------------------------------|--------------------------------------------------|
| GET    | `/products`                  | List with search, filters, sort, pagination      |
| GET    | `/products/facets`           | Filter facets for current query context          |
| GET    | `/products/autocomplete?q=`  | Autocomplete (products + brands)                 |
| GET    | `/products/slug/:slug`       | Product by SEO slug                              |
| GET    | `/products/:id`              | Product by numeric ID                            |
| GET    | `/products/:id/quick-view`   | Compact data for modal/overlay                   |
| GET    | `/products/:id/related`      | Related products in same category                |

**Product list query params:** `q`, `category`, `categoryId`, `brand[]`, `minPrice`, `maxPrice`, `minRating`, `inStock`, `sort` (`relevance|price_asc|price_desc|rating|popularity|newest`), `page`, `limit` (24/48/96), `cursor`, `attributes` (JSON string).

### Categories

| Method | Path                  | Description                      |
|--------|-----------------------|----------------------------------|
| GET    | `/categories`         | Flat list with product counts    |
| GET    | `/categories/tree`    | Nested tree for navigation       |
| GET    | `/categories/:slug`   | Category by slug                 |

### Saved Searches

| Method | Path                   | Description                                |
|--------|------------------------|--------------------------------------------|
| GET    | `/saved-searches`      | List saved searches for current session    |
| POST   | `/saved-searches`      | Save a search/filter combination           |
| DELETE | `/saved-searches/:id`  | Delete a saved search                      |

### System

| Method | Path             | Description                        |
|--------|------------------|------------------------------------|
| GET    | `/api/docs`      | Swagger UI                         |

## Database

SQLite with WAL journal mode and enforced foreign keys.

**Tables:** `categories`, `products`, `product_attributes` (EAV), `saved_searches`, `products_fts` (FTS5 virtual table).

**Migrations:** TypeORM migrations run automatically on startup (`migrationsRun: true`). Seeds if `products` table is empty (via `DatabaseModule.onModuleInit()`).

**FTS5:** Porter stemmer + unicode61 tokenizer. BM25 ranking for relevance sort. Triggers keep `products_fts` in sync with `products`.

## Key Patterns

**DB access in repositories:** TypeORM's `dataSource.driver` is cast to `{ databaseConnection: Database.Database }` to access the underlying better-sqlite3 instance, preserving named SQL params (`@param` syntax) and synchronous prepared statements.

**Session:** Stateless, header-based. `x-session-id` UUID is read or generated per request by `SessionMiddleware` and echoed back in the response header. `@SessionId()` param decorator extracts it in controllers.

**Pagination:** Supports both offset (`page`/`limit`) and cursor (`cursor` = base64url-encoded `{offset}`) simultaneously. Fetches `limit + 1` rows to determine `hasMore`.

**Faceted filtering:** `getFacets` strips brand/price/rating/attribute filters before counting — "open facets" pattern so each dimension shows independent counts.

**Error handling:** `AllExceptionsFilter` maps `HttpException` → its status, everything else → 500. `ValidationPipe` with `whitelist: true` applied globally and per-query.

**SEO:** Product detail responses include JSON-LD (`schema.org/Product`), canonical URL, and Open Graph meta. Listing responses include `schema.org/ItemList`.
