# Research: Fix Technical Screener Reactive State

**Branch**: `017-fix-technical-screener-state` | **Date**: 2026-06-01

## Decision 1: How to make `SvelteSet` reactive in Svelte 5

**Decision**: Wrap the `SvelteSet` constructor call with `$state()`:

```svelte
let selectedPatterns = $state(new SvelteSet<string>());
```

**Rationale**: In Svelte 5 runes mode, `$state()` is required to declare reactive variables. `SvelteSet` (from `svelte/reactivity`) is a reactive-aware collection, but without `$state()` the variable binding itself is not tracked by the compiler. Wrapping with `$state()` tells the Svelte compiler to track this binding and trigger re-renders when mutations occur (`.add()`, `.delete()`, `.clear()`).

**Alternatives considered**:
- Replace `SvelteSet` with a plain `$state(new Set<string>())` — rejected because `SvelteSet` provides fine-grained reactivity on individual mutation methods; a plain `Set` inside `$state` would require a full reassignment to trigger updates.
- Use a `$derived` reactive array — rejected as unnecessarily complex; the snapshot logic already handles serialisation to/from array.

---

## Decision 2: Snapshot compatibility after the fix

**Decision**: No changes needed to the snapshot `capture`/`restore` logic.

**Rationale**: `capture` spreads `selectedPatterns` into an array (`[...selectedPatterns]`), which works identically regardless of the `$state` wrapper. `restore` calls `selectedPatterns.clear()` and `.add()`, which are `SvelteSet` mutation methods — these already work; the issue was only that Svelte wasn't tracking the variable binding.

**Alternatives considered**: Refactoring snapshot to use array-diff — rejected as out of scope.

---

## Decision 3: Handling unknown pattern IDs on snapshot restore

**Decision**: Filter out unknown IDs silently during restore (per clarification session).

**Rationale**: The existing `TechnicalScreenerSchema` validates the snapshot shape (array of strings) but does not validate that each string is a known pattern ID. The restore block should continue to use `.add()` for each ID in the snapshot; unknown IDs that no longer map to available patterns will simply not match any rendered checkbox and will be harmless, or the ScreenerChartPatternPanel component can ignore them during render. No schema change is needed.

---

## Decision 4: Playwright test structure

**Decision**: Follow the existing project e2e pattern (see `screener-organism-refactor.e2e.ts`): import from `@playwright/test`, group tests with `test.describe`, navigate to the page, assert no console errors of type `non_reactive_update`.

**Rationale**: Consistent with the established project pattern. Playwright's `page.on('console', ...)` listener can capture console messages and assert none match the Svelte reactivity warning pattern.

**Test scenarios to cover**:
1. Navigate to `/technical-screener` → zero `non_reactive_update` console messages
2. Select a chart pattern → UI updates (checkbox/button reflects selected state)
3. Snapshot round-trip: select pattern, navigate away, navigate back → pattern still selected
