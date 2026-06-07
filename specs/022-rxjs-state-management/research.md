# Research: RxJS State Management (022)

**Date**: 2026-06-07
**Feature**: [spec.md](./spec.md)

---

## Decision 1: RxJS BehaviorSubject vs SvelteKit stores

**Decision**: Use RxJS `BehaviorSubject` as the reactive primitive, NOT SvelteKit writable stores.

**Rationale**: The feature explicitly requires RxJS BehaviorSubjects. RxJS provides `switchMap` (in-flight request cancellation), composable operators, and a well-known reactive contract that is framework-agnostic. SvelteKit writable stores lack native cancellation and cannot compose with `from(promise)` pipelines out of the box.

**Alternatives considered**:
- SvelteKit writable stores: simpler but lack cancellation semantics
- Svelte 5 `$state` only: no stream composition, no switchMap
- TanStack Query: heavier dependency, opinionated caching not aligned with this project's pattern

---

## Decision 2: Separation of RxJS layer from Svelte $state

**Decision**: The `src/lib/rxjs/` layer MUST NOT be imported inside `src/lib/state/*.svelte.ts` files. Subscriptions from RxJS streams into Svelte $state happen at the **app entry point / layout** level (e.g., `+layout.svelte` `onMount`).

**Rationale**: The existing BDD scenario in `features/zodios-api-client.feature` asserts:

> "State modules compile without RxJS dependency — no RxJS or Observable import is present in any file under src/lib/state/"

This constraint must not be violated. The clean architecture is: RxJS streams feed Svelte $state via subscription glue in layout/page components, keeping `src/lib/state/` free of RxJS imports.

**Alternatives considered**:
- Import RxJS inside state modules directly: violates existing BDD scenario and breaks the "stateless sink" pattern
- Use Svelte `$effect` inside state class: couples framework lifecycle to the state class

---

## Decision 3: `switchMap` pattern for request cancellation

**Decision**: Use `Subject` as a trigger combined with `switchMap(() => from(apiClient.listX()))` to cancel in-flight requests.

**Rationale**: `BehaviorSubject` alone cannot cancel in-flight fetches. The standard pattern is a `Subject<void>` trigger piped through `switchMap` into the API promise, with the result pushed into a separate `BehaviorSubject<T | null>` that components subscribe to.

**Pattern**:
```
const refresh$ = new Subject<void>();
const data$ = new BehaviorSubject<T | null>(null);
const error$ = new BehaviorSubject<Error | null>(null);

refresh$.pipe(
  switchMap(() => from(apiClient.listX()).pipe(catchError(err => { error$.next(err); return EMPTY; })))
).subscribe(result => { data$.next(result); error$.next(null); });

export const refresh = () => refresh$.next();
export { data$, error$ };
```

---

## Decision 4: RxJS version

**Decision**: Use `rxjs@7.x` (latest stable, `^7.8.1`).

**Rationale**: RxJS 7 is the current LTS-equivalent stable release. It is tree-shakeable, supports ES2015+ imports, and works with Vite/Rollup bundlers without configuration. RxJS 8 is still in alpha. The license is Apache-2.0 (constitutionally permitted).

---

## Decision 5: Market-metric Zod schema location

**Decision**: Add `src/lib/zodios/schemas/market-metric.schema.ts` (API-aligned shape). Do NOT modify `src/lib/schemas/market-metric.schema.ts` (UI-centric shape).

**Rationale**: The two schemas serve different domains. The UI schema has a `deltaPositive: boolean` computed field and string `value`; the API schema has numeric `value`, `change`, `change_pct`, and a `stale` flag. Merging them would break existing organisms.

---

## Decision 6: BDD feature file

**Decision**: Create `features/rxjs-state-management.feature` covering the three user stories. Update the existing BDD scenario in `zodios-api-client.feature` that asserts "no RxJS import in state modules" by adding a note that the assertion still holds (RxJS imports are in `src/lib/rxjs/`, not `src/lib/state/`).

---

## Decision 7: Zodios client — in-place extension, not new client

**Decision**: Extend `src/lib/zodios/client.ts` by adding two new endpoints (aliases `listMarketMetrics`, `getMarketMetric`) to the existing `backtestEapiEndpoints` array and exporting new schemas from `src/lib/zodios/index.ts`.

**Rationale**: The Zodios client is already a singleton; a second client instance would risk base URL drift and duplicate auth header injection.
