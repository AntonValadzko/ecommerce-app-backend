# Current State — Architecture Analysis

## System purpose

A **product catalog API**: list/search/filter products (OpenSearch), product detail and writes (Postgres), with Redis for caching, rate limiting, sessions, and async search indexing.

## What works well

### 1. Clear domain core

`domain/` holds models and repository **ports** with no NestJS or ORM imports. Application services depend only on interfaces (`IProductRepository`, `IProductSearchRepository`), which is the right direction for testability and swap-friendly adapters.

### 2. Read vs write data store split

| Concern | Store | Rationale |
|---------|-------|-----------|
| Source of truth | PostgreSQL | ACID writes, relations, detail pages |
| List / search / facets / autocomplete | OpenSearch | Full-text, aggregations, relevance |
| Hot read paths | Redis | TTL cache with version bump invalidation |

This is a standard and appropriate **CQRS-lite** split for a catalog (not full event sourcing).

### 3. Decorator pattern for cache

`CachedProductRepository`, `CachedProductSearchRepository`, etc. wrap inner adapters and implement the same port. Feature toggle via `redis.enabled` in factory providers is clean.

### 4. Graceful degradation

- `OPENSEARCH_ENABLED=false` → Postgres fallback search (`PostgresProductSearchRepository`)
- Redis down → sync OpenSearch index instead of queue
- `NoOpProductIndexer` when search disabled

Good operational thinking for local/dev and partial outages.

---

## Friction points (solution architecture view)

### A. Module coupling and blurred ownership

```
PersistenceModule ──imports──► SearchModule
SearchModule ──imports──► RedisModule
SearchModule ──registers──► PostgresProductSearchRepository (lives under persistence/)
search.providers.ts ──wires──► Product/Category/SavedSearch repos (persistence concern)
CachedProductRepository ──depends on──► ProductIndexQueueService (search concern)
```

**Symptom:** Hard to answer “who owns product writes end-to-end?” without reading three modules.

**Impact:** New adapters (e.g. Elasticsearch instead of OpenSearch) require touching persistence wiring, not just search.

### B. Side effects hidden in infrastructure decorators

`CachedProductRepository.create/update` triggers:

1. Postgres write
2. Cache invalidation (`CacheInvalidationService`)
3. Search index queue (`ProductIndexQueueService`)

These are **business-relevant orchestration steps**, but they live inside a cache decorator. Application layer (`ProductsService`) looks like a thin pass-through for writes.

**Impact:** Harder to reason about transactional boundaries, testing write flows, or adding audit/events later.

### C. `database/` as a parallel top-level layer

Entities, migrations, mappers sit in `src/database/` while repositories sit in `infrastructure/persistence/`. Both are persistence concerns split across two roots.

**Impact:** Onboarding friction — “is database a layer or infrastructure detail?”

### D. Composition root is scattered

Provider factories in `search.providers.ts` bind:

- OpenSearch vs Postgres search backend
- Redis cache vs raw repos
- Product, category, saved-search repositories

Persistence and search modules both participate in the same composition graph.

**Impact:** One place to look when debugging “which implementation am I running?” would be simpler.

### E. Cross-cutting HTTP concerns split across layers

- `SessionMiddleware` → presentation
- `RedisRateLimitMiddleware` → infrastructure/redis
- Both registered in `AppModule`

Minor, but a **platform** or **http** module would group “everything about the HTTP edge.”

---

## Layer compliance scorecard

| Layer | Compliance | Notes |
|-------|------------|-------|
| Domain | Strong | Pure TS, ports, models |
| Application | Good | Uses ports; write orchestration could be richer |
| Infrastructure | Mixed | Good adapters; coupling + hidden orchestration |
| Presentation | Good | DTOs, controllers, presenters separated |
| Database | Ambiguous | Should fold under persistence adapter |

---

## Verdict

The project is **architecturally sound for a learning/production catalog API** — not over-engineered. Refinement should focus on **composition**, **module boundaries**, and **explicit write orchestration**, not adding DDD aggregates, event buses, or microservices.

See [03-refined-layers.md](./03-refined-layers.md) for a simpler target structure.
