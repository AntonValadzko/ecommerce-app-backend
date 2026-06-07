# E-Commerce Catalog Backend

A product catalog REST API built with NestJS and TypeScript. **PostgreSQL** (via PgBouncer) is the source of truth; **OpenSearch** powers list/search/facets/autocomplete. Layered / ports-and-adapters architecture.

## Tech Stack

- **Runtime:** Node.js >= 20
- **Language:** TypeScript 5.8 (strict mode, CommonJS modules)
- **Framework:** NestJS 10
- **Database:** PostgreSQL 16 through **PgBouncer** (`localhost:6432`)
- **Search:** OpenSearch 2.x (`OPENSEARCH_NODE`, index `products`)
- **ORM:** TypeORM 0.3 (`migrationsRun: true`, `synchronize: false`)
- **Validation:** `class-validator` + `class-transformer`
- **Docs:** Swagger at `/api/docs`
- **Local infra:** `docker compose up -d` (Postgres, PgBouncer, OpenSearch, Redis)

## Project Structure

```
src/
  domain/                    Models + ports (IProductRepository, IProductSearchRepository, …)
  application/               Use cases (inject ports via symbols)
  infrastructure/
    persistence/             Postgres TypeORM repositories (inner)
    search/                  OpenSearch adapter, indexer, index queue
    redis/                   Redis client, cache; Cached*Repository decorators
  presentation/http/         Controllers, DTOs, presenters, middleware
  database/                  Entities, migrations, bulk-load CLI, mappers
  config/configuration.ts    DATABASE_*, OPENSEARCH_*, Redis URL
docker-compose.yml
```

## Local development with Docker

Infrastructure is defined in `docker-compose.yml`. The NestJS app runs on the host; databases run in containers.

| Service | Host port | App connects? | Notes |
|---------|-----------|---------------|--------|
| postgres | 5432 | No (debug/SQL only) | user/db/password: `catalog` |
| **pgbouncer** | **6432** | **Yes** (`DATABASE_PORT`) | Transaction pooling |
| opensearch | 9200 | Yes (`OPENSEARCH_NODE`) | Security plugin disabled locally |
| redis | 6379 | Yes | Cache, rate limit, sessions, index queue |

```bash
docker compose up -d          # start
docker compose ps             # health status
docker compose logs -f        # tail logs
docker compose down           # stop, keep volumes
docker compose down -v        # stop + wipe data
```

Verify: `curl http://localhost:9200/_cluster/health?pretty` and `docker compose exec postgres pg_isready -U catalog -d catalog`.

Copy `.env.example` → `.env` before running the app. OpenSearch may take ~1 min on first boot.

## Development Commands

```bash
docker compose up -d
cp .env.example .env
npm install
npm run build
npm run db:seed          # Postgres bulk demo data + OpenSearch index
npm run dev
npm run search:reindex   # Reindex OpenSearch from Postgres
npm run db:migrate       # Migrations only (after build)
npm run lint
```

Unit tests: Jest + `@nestjs/testing` (`npm test`, `npm run test:cov`).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `DATABASE_HOST` | `localhost` | DB host (PgBouncer) |
| `DATABASE_PORT` | `6432` | PgBouncer port |
| `DATABASE_USER` / `PASSWORD` / `NAME` | `catalog` | Postgres credentials |
| `OPENSEARCH_NODE` | `http://localhost:9200` | OpenSearch URL |
| `OPENSEARCH_INDEX` | `products` | Search index |
| `REDIS_URL` | `redis://localhost:6379` | Cache decorators, rate limit, sessions |
| `REDIS_ENABLED` | `true` | Set `false` to disable Redis features |

## API

Base path: `/api/v1`

### Products

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List (OpenSearch), filters, `search_after` cursor |
| GET | `/products/facets` | Facets (OpenSearch aggregations) |
| GET | `/products/autocomplete?q=` | Suggestions |
| GET | `/products/slug/:slug` | Detail (Postgres) |
| GET | `/products/:id` | Detail by id (Postgres) |
| GET | `/products/:id/quick-view` | Quick view (Postgres) |
| GET | `/products/:id/related` | Related (Postgres) |
| POST | `/products` | Create (Postgres + OpenSearch index) |
| PATCH | `/products/:id` | Partial update + re-index |

**List query params:** `q`, `category`, `categoryId`, `brand[]`, `minPrice`, `maxPrice`, `minRating`, `inStock`, `sort`, `page`, `limit`, `cursor` (OpenSearch `search_after`), `attributes` (JSON).

**Route order:** `/`, `/facets`, `/autocomplete`, `/slug/:slug`, `/:id/quick-view`, `/:id/related`, `/:id`.

### Categories / Saved searches / Swagger

Same as README — categories from Postgres; saved searches in Postgres (`query_json` JSONB).

## Database

**Postgres tables:** `categories`, `products`, `product_attributes`, `saved_searches`.

**Migrations:** `PostgresInitial1700000000000` — run on app/CLI startup.

**No auto-seed on API start.** Use `npm run db:seed` (bulk-load + index) or `npm run search:reindex`.

## Key Patterns

**Ports:** `PRODUCT_REPOSITORY` → `ProductRepository` (Postgres). `PRODUCT_SEARCH_REPOSITORY` → `OpenSearchProductSearchRepository`. Application services inject both.

**Pagination:** `cursor` = base64url `SearchCursor` `{ sort, searchAfter }` for stable infinite scroll. `page` uses offset (OK for shallow pages).

**Facets:** Open facets — brand/price/rating/attribute filters stripped before facet aggregations.

**Errors:** `EntityNotFoundError` → 404. Global `ValidationPipe` (`whitelist`, `transform`).

**SEO:** `ProductsPresenter` — JSON-LD, canonical URLs.

**Reindex:** After bulk catalog loads, run `npm run search:reindex`. Production would use CDC/outbox → indexer.

## Adding a Feature

1. Domain — model + port method(s)
2. Application — service use case
3. Infrastructure — Postgres and/or OpenSearch adapter
4. Presentation — DTO, controller, presenter
5. Reindex if search documents change
