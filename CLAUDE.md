# E-Commerce Catalog Backend

A product catalog REST API built with NestJS and TypeScript, backed by SQLite. Provides full-text search, faceted filtering, cursor pagination, and SEO metadata for a frontend storefront.

Uses a **layered / ports-and-adapters** architecture: domain → application → infrastructure → presentation.

## Tech Stack

- **Runtime:** Node.js >= 20
- **Language:** TypeScript 5.8 (strict mode, CommonJS modules)
- **Framework:** NestJS 10 (`@nestjs/core`, `@nestjs/platform-express`)
- **Database:** SQLite via `better-sqlite3`, configured through TypeORM
- **ORM:** TypeORM 0.3 with `migrationsRun: true`, `synchronize: false`
- **Validation:** `class-validator` + `class-transformer` DTOs
- **Docs:** Swagger UI at `/api/docs` via `@nestjs/swagger`
- **Security:** `helmet`, `cors`

## Project Structure

```
src/
  main.ts                              Bootstrap (NestFactory, Swagger, global pipes/filters)
  app.module.ts                        DatabaseModule + PersistenceModule + presentation modules

  config/
    configuration.ts                   ConfigModule factory (port, dbPath, limits)

  domain/                              Models + repository ports (no Nest/TypeORM imports)
    common/entity-not-found.error.ts
    products/
      product.model.ts                 Product, ProductListItem, ProductQuery, etc.
      product.repository.port.ts       IProductRepository, PRODUCT_REPOSITORY symbol
    categories/
      category.model.ts
      category.repository.port.ts
    saved-searches/
      saved-search.model.ts
      saved-search.repository.port.ts

  application/                         Use cases — inject ports via @Inject(TOKEN)
    products/products.service.ts       list, get, facets, autocomplete, related; normalizeLimit
    categories/categories.service.ts
    saved-searches/saved-searches.service.ts

  infrastructure/
    persistence/
      persistence.module.ts            @Global — binds ports to repository classes
      repositories/
        product.repository.ts          TypeORM: findById, findBySlug, findQuickView, findRelated
        product-search.repository.ts   Raw SQL: findMany, getFacets, autocomplete (FTS5)
        category.repository.ts         TypeORM + loadRelationCountAndMap
        saved-search.repository.ts     TypeORM

  presentation/http/                   HTTP adapters
    common/
      middleware/session.middleware.ts
      filters/all-exceptions.filter.ts EntityNotFoundError → 404, HttpException passthrough
      decorators/session-id.decorator.ts
      utils/base-url.ts
    products/
      products.module.ts
      products.controller.ts           Thin — delegates to service + presenter
      products.presenter.ts            { data, pagination, meta }, SEO / JSON-LD
      product-response.types.ts
      dto/                             product-list-query.dto.ts, autocomplete-query.dto.ts
    categories/
      categories.controller.ts
      categories.presenter.ts
      categories.module.ts
    saved-searches/
      saved-searches.controller.ts
      saved-searches.presenter.ts
      dto/create-saved-search.dto.ts, product-query.dto.ts
      saved-searches.module.ts

  database/                            Schema + TypeORM wiring
    database.module.ts                 @Global forRootAsync + seed on init
    database.constants.ts              DATABASE_ENTITIES, DATABASE_MIGRATIONS
    entities/                          TypeORM entities (schema source of truth)
    mappers/                           Entity → domain model
    migrations/                        InitialSchema, Fts5
    seed.ts                            TypeORM transaction + FTS rebuild
    sqlite-base.repository.ts          FTS-only raw SQL base class
    data-source.ts                     Standalone DataSource for TypeORM CLI

data/                                  SQLite DB file (gitignored)
dist/                                  Compiled output (gitignored)
```

## Development Commands

```bash
npm run dev        # nest start --watch — hot reload dev server
npm run build      # nest build — compile to dist/
npm run start      # node dist/main — run production build
npm run lint       # tsc --noEmit — type-check only
npm run db:migrate # typeorm migration:run (requires build first)
```

No test framework is configured.

## Environment Variables

| Variable   | Default                  | Description               |
|------------|--------------------------|---------------------------|
| `PORT`     | `3000`                   | HTTP listen port          |
| `NODE_ENV` | `development`            | Environment name          |
| `DB_PATH`  | `<cwd>/data/catalog.db`  | SQLite database file path |

No `.env` file is committed. Config is injected via `ConfigService` (`@nestjs/config`).

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

**Route order in ProductsController:** `/`, `/facets`, `/autocomplete`, `/slug/:slug`, `/:id/quick-view`, `/:id/related`, `/:id` — static segments before `:id`.

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

SQLite file at `DB_PATH` (default `data/catalog.db`).

**Tables:** `categories`, `products`, `product_attributes` (EAV), `saved_searches`, `products_fts` (FTS5 virtual table).

**Migrations:** TypeORM migrations run automatically on startup (`migrationsRun: true`). Seeds if `products` table is empty (via `DatabaseModule.onModuleInit()`).

**FTS5:** Porter stemmer + unicode61 tokenizer. BM25 ranking for relevance sort. Triggers keep `products_fts` in sync with `products`. Seed ends with `INSERT INTO products_fts(products_fts) VALUES('rebuild')`.

## Key Patterns

**Layering:** Presentation → Application → Domain. Infrastructure implements domain ports. Application never imports TypeORM, SQLite, or Express.

**Repository ports:** `PRODUCT_REPOSITORY`, `CATEGORY_REPOSITORY`, `SAVED_SEARCH_REPOSITORY` symbols exported from `domain/*/`.repository.port.ts. `PersistenceModule` uses `{ provide: TOKEN, useExisting: ConcreteRepository }`.

**DB access:** TypeORM entities define schema. `ProductRepository` / `CategoryRepository` / `SavedSearchRepository` use TypeORM with `database/mappers/` for entity→domain mapping. `ProductSearchRepository` extends `SqliteBaseRepository` for FTS5 and dynamic facet SQL only.

**Session:** Stateless, header-based. `x-session-id` UUID is read or generated per request by `SessionMiddleware` and echoed back. `@SessionId()` decorator in presentation layer.

**Pagination:** Offset (`page`/`limit`) and cursor (`cursor` = base64url `{offset}`). Fetches `limit + 1` rows for `hasMore`.

**Faceted filtering:** `getFacets` strips brand/price/rating/attribute filters — open facets pattern.

**Error handling:** `EntityNotFoundError` from application → 404 in `AllExceptionsFilter`. `HttpException` passthrough. Other errors → 500. Global `ValidationPipe` with `transform: true`, `whitelist: true`.

**SEO:** `ProductsPresenter.buildProductSeo` / `buildListingSeo` — JSON-LD, canonical URL, Open Graph. Uses `getBaseUrl(req)` from presentation utils.

**Swapping DB:** Replace `infrastructure/persistence/repositories/*`, migrations, and `DatabaseModule` config. Reimplement `ProductSearchRepository` for non-SQLite search. Domain, application, and presentation stay unchanged if ports are stable.

## Adding a Feature (checklist)

1. **Domain** — model fields + port method(s) if persistence needed.
2. **Application** — service method(s), throw `EntityNotFoundError` when appropriate.
3. **Infrastructure** — implement in repository adapter(s).
4. **Presentation** — DTO, controller route, presenter response shape.
5. **PersistenceModule** — only if new port/token or repository class.
