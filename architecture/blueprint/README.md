# Architecture Blueprint (Reference Skeleton)

These files are **documentation-only examples** — they illustrate patterns from [03-refined-layers.md](../03-refined-layers.md). They are not wired into the NestJS build.

## Files

| File | Shows |
|------|-------|
| `ports/product-index-sync.port.ts` | Small port for write side effects |
| `ports/cache-invalidator.port.ts` | Cache bust abstraction |
| `application/product-catalog.service.ts` | Explicit write orchestration |
| `composition/search.providers.ts` | Centralized adapter selection |
| `adapters/redis/cached-product.repository.readonly.ts` | Read-only cache decorator |

Compare with current code:

- Write side effects today: `src/infrastructure/redis/repositories/cached-product.repository.ts`
- Provider wiring today: `src/infrastructure/search/search.providers.ts`
