# Research: Fix Technical Screener Reactive State

**Branch**: `017-fix-technical-screener-state` | **Date**: 2026-06-01

## Decision 1: `SvelteSet` is self-reactive — `$state()` wrapping is incorrect

**Decision**: Declare `selectedPatterns` without `$state()`:

```svelte
let selectedPatterns = new SvelteSet<string>();
```

**Rationale**: `SvelteSet` (and `SvelteMap`, `SvelteURL`, etc.) from `svelte/reactivity` implement Svelte 5's internal signal protocol natively. They are reactive data structures without any `$state()` wrapper. Wrapping them in `$state()` is redundant and is explicitly forbidden by the project's ESLint rule `svelte/no-unnecessary-state-wrap` (eslint-plugin-svelte v3.17+), which treats it as an error and blocks `ci-format-lint`.

The original `vite-plugin-svelte` dev-mode warning (`non_reactive_update` at line 16:5) was a **false positive**: the warning fires when Svelte detects that a variable is mutated without being in `$state`, but `SvelteSet` mutations are tracked internally by the class itself. No code change is needed to resolve the warning — it does not affect runtime correctness and does not appear in production builds.

**Alternatives considered**:
- `$state(new SvelteSet<string>())` — **rejected**: violates `svelte/no-unnecessary-state-wrap`, blocks CI.
- Replace `SvelteSet` with a plain `$state(new Set<string>())` — rejected because a plain `Set` inside `$state` only triggers reactivity on full reassignment, not on `.add()` / `.delete()` / `.clear()` mutations.
- Use a `$derived` reactive array — rejected as unnecessarily complex.

---

## Decision 2: Snapshot compatibility — no changes needed

**Decision**: No changes needed to the snapshot `capture`/`restore` logic.

**Rationale**: `capture` spreads `selectedPatterns` into an array (`[...selectedPatterns]`), which works identically with a plain `SvelteSet`. `restore` calls `selectedPatterns.clear()` and `.add()` — these are `SvelteSet` mutation methods that are reactive by nature.

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
