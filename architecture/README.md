# E-Commerce Catalog Backend — Architecture

This folder contains a **solution architecture review** of the current NestJS backend and a **refined layered blueprint** that keeps the same capabilities (Postgres, OpenSearch, Redis) with clearer boundaries.

| Document | Purpose |
|----------|---------|
| [01-current-state-analysis.md](./01-current-state-analysis.md) | What exists today, strengths, friction points |
| [02-system-context.md](./02-system-context.md) | Runtime topology, data stores, request flows |
| [03-refined-layers.md](./03-refined-layers.md) | Proposed folder layout and layer rules |
| [blueprint/](./blueprint/) | Minimal skeleton showing wiring patterns (not runnable) |

## Quick summary

The current project already follows **ports & adapters** well. The main improvement is **where composition happens** and **who owns side effects** (cache invalidation, search indexing), not adding more layers.

```
Today:     Presentation → Application → Domain ← Infrastructure (coupled modules)
Refined:   Presentation → Application → Domain ← Adapters (flat) + Composition root
```

Start with [01-current-state-analysis.md](./01-current-state-analysis.md), then [03-refined-layers.md](./03-refined-layers.md) if you want to refactor incrementally.
