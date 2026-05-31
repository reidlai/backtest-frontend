# Research: Market Regime Page Organisms

**Branch**: `010-market-regime-organisms` | **Date**: 2026-05-31

## Decision Log

### 1. Zod Schema Placement

**Decision**: Create two new schema files — `market-environment-summary.schema.ts` and `regime-cards-grid.schema.ts` — under `src/lib/schemas/`, exporting both from `src/lib/schemas/index.ts`.

**Rationale**: Every existing organism schema follows this pattern (e.g., `dashboard-metric-grid.schema.ts` → `DashboardMetricGridSchema`). The existing `MarketRegimeSchema` in `market-regime.schema.ts` is already exported from the index and will be reused as the array element type in `RegimeCardsGridSchema`.

**Alternatives considered**: Inline Zod validation inside the component — rejected because it breaks the established schema-first contract generation workflow (Constitution Rule 12).

---

### 2. Organism Component Props Pattern

**Decision**: Use `$state` with `z.infer<typeof Schema>` for component state, initialized via `Schema.parse({})`, consistent with `DashboardMetricGrid.svelte`.

**Rationale**: `DashboardMetricGrid.svelte` is the closest analogue (a grid of items driven by a schema-backed state object). The pattern `let state = $state<z.infer<typeof Schema>>(Schema.parse({}))` is already established.

**Alternatives considered**: Plain TypeScript props without `$state` — rejected because it diverges from the existing organism pattern and loses runtime Zod validation.

---

### 3. Empty State for RegimeCardsGrid

**Decision**: Render a simple centered message ("No regime data available") inside the grid container when the `regimes` array is empty.

**Rationale**: Clarification Q2 confirmed this is required. A blank area is confusing to users. The message should be consistent in style with other muted-foreground text used in the app.

**Alternatives considered**: Dedicated empty-state component — deferred; out of scope for this feature.

---

### 4. MarketEnvironmentSummary State Shape

**Decision**: The schema will have a single `summary` string field (defaulting to `""`). The AI badge and heading are static UI — they do not need to be props.

**Rationale**: Only the summary text varies between usages. The AI badge icon and section heading are fixed presentation. Keeping the schema minimal follows YAGNI.

**Alternatives considered**: Making heading configurable — rejected as over-engineering for a single-use organism.

---

### 5. No New BDD Feature Files Required

**Decision**: This is a pure UI refactor — no new behaviors are introduced. Existing acceptance scenarios in `spec.md` serve as the BDD specification. No new Cucumber feature files needed.

**Rationale**: The page renders identically before and after. No new user-observable behaviors are added. Constitution Rule 6 applies to new behaviors, not structural refactors that preserve existing behavior.

**Alternatives considered**: Writing a Cucumber feature for visual regression — deferred; would require Playwright/Storybook visual diff tooling not currently in the project.
