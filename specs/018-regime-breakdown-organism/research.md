# Research: Regime Breakdown Organism

**Feature**: `018-regime-breakdown-organism` | **Date**: 2026-06-01

## Decision 1: Component State Approach (Svelte 5 Runes)

**Decision**: Use Svelte 5 `$state()` rune to declare local reactive state inside the organism.

**Rationale**: The project already uses Svelte 5 runes (`$state`, `$derived`) throughout existing organisms (e.g., `PerformanceMetricGrid.svelte`). Consistency with the established pattern is the only reasonable choice.

**Alternatives considered**: Svelte 4 stores (`writable`) — rejected because the project is on Svelte 5 and stores are the legacy approach.

---

## Decision 2: Zod Validation Strategy

**Decision**: Use `RegimeBreakdownSchema.array().parse()` inside the component initialization, wrapped in a `safeParse` to silently filter invalid rows rather than throwing.

**Rationale**: `safeParse` returns `{ success, data, error }` without throwing, allowing the organism to filter out invalid rows and still render the valid subset. This matches FR-003 and SC-003 (invalid rows excluded, no page crash).

**Alternatives considered**:
- `parse()` (throws on error) — rejected because a single bad row would crash the whole component.
- Manual field-by-field checks — rejected because `RegimeBreakdownSchema` already exists and is the authoritative schema.

**Implementation pattern**:
```ts
import { RegimeBreakdownSchema } from '$lib/schemas/regime-breakdown.schema';
import { sampleRegimeBreakdown } from '$lib/shared-mockdata/performance';

const rawData = sampleRegimeBreakdown;
const rows = $state(
  rawData.filter((row) => RegimeBreakdownSchema.safeParse(row).success)
);
```

---

## Decision 3: Empty State Rendering

**Decision**: When `rows` has length 0, render a single `<Table.Row>` spanning all 4 columns with the text "No data available."

**Rationale**: shadcn-svelte `Table` primitives already support `colspan`. A single message row is the conventional pattern used by other tables in the codebase (e.g., `ScreenerResultTable.svelte`).

**Alternatives considered**: Hide the entire table and show a `<div>` — rejected because it would change the layout dimensions and affect the 2-column grid layout on the performance result page.

---

## Decision 4: Storybook Story

**Decision**: Create a Storybook story for `RegimeBreakdownTable` with three story variants: default (mock data), empty state, and one invalid-row-filtered state.

**Rationale**: Constitution Rule 12 requires Storybook verification before implementation. The three variants cover the main acceptance scenarios from the spec.

**Alternatives considered**: Skip Storybook for a pure refactor — rejected because the constitution gates require it and the organism introduces a new visual state (empty state) not previously tested.
