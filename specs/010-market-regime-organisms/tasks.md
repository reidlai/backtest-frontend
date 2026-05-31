# Tasks: Market Regime Page Organisms

**Input**: Design documents from `specs/010-market-regime-organisms/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**BDD-First (Constitution Rule 6 — MANDATORY)**: This feature is a pure UI structural refactor with no new user-observable behaviors. No new Cucumber feature files are required (confirmed in research.md). Constitution Rule 6 applies to new behaviors — the existing Given/When/Then scenarios in spec.md serve as the behavioral specification.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Zod schemas — foundational data contracts that both organisms depend on (Constitution Rule 12: Zod schemas precede component implementation)

- [x] T001 [P] [ZOD] Create `MarketEnvironmentSummarySchema` in `src/lib/schemas/market-environment-summary.schema.ts`
- [x] T002 [P] [ZOD] Create `RegimeCardsGridSchema` in `src/lib/schemas/regime-cards-grid.schema.ts` (imports `MarketRegimeSchema` from `market-regime.schema.ts`)
- [x] T003 Update `src/lib/schemas/index.ts` — add exports for `market-environment-summary.schema` and `regime-cards-grid.schema`

**Checkpoint**: Both schemas importable via `$lib/schemas`. Run `pnpm check` — no type errors.

---

## Phase 2: User Story 1 — Market Environment Summary Organism (Priority: P1) 🎯 MVP

**Goal**: Extract the AI summary panel into a standalone `MarketEnvironmentSummary` organism component backed by a Zod schema.

**Independent Test**: Render the component in the browser (or Storybook) with a sample summary string. Verify the AI badge, heading, and styled paragraph are visible. Verify rendering with an empty string produces no layout breakage.

- [x] T004 [US1] Create `MarketEnvironmentSummary.svelte` organism in `src/lib/components/organisms/MarketEnvironmentSummary.svelte` — use `MarketEnvironmentSummarySchema` for state, accept `summary` prop, render AI badge + heading + paragraph (exact markup from `src/routes/market-regime/+page.svelte`)
- [x] T005 [STORYBOOK] [US1] Create `src/stories/MarketEnvironmentSummary.stories.svelte` — document default state (with summary text) and empty-string state (Constitution Rule 12: Storybook documentation required)
- [x] T006 [US1] Update `src/routes/market-regime/+page.svelte` — import `MarketEnvironmentSummary` and replace the inline summary `<div>` with `<MarketEnvironmentSummary summary={aiSummary} />`
- [x] T007 [US1] Run `pnpm check` and `pnpm lint` — verify no type or lint errors

**Checkpoint**: Market Regime page renders with `MarketEnvironmentSummary` organism. Visual appearance unchanged. `pnpm check` passes.

---

## Phase 3: User Story 2 — Regime Cards Grid Organism (Priority: P2)

**Goal**: Extract the regime cards grid into a standalone `RegimeCardsGrid` organism component backed by a Zod schema, with an empty state message when no regimes are provided.

**Independent Test**: Render the component with sample regime data — verify the responsive grid and individual `RegimeCard` molecules display correctly. Render with an empty array — verify "No regime data available" message appears instead of a blank area.

- [x] T008 [US2] Create `RegimeCardsGrid.svelte` organism in `src/lib/components/organisms/RegimeCardsGrid.svelte` — use `RegimeCardsGridSchema` for state, accept `regimes` prop, render responsive grid of `RegimeCard` molecules; show `<p class="text-sm text-muted-foreground">No regime data available</p>` when `state.regimes` is empty
- [x] T009 [STORYBOOK] [US2] Create `src/stories/RegimeCardsGrid.stories.svelte` — document default state (with sample regimes), empty-array state (empty state message), and mixed-status state (active/warning/inactive cards) (Constitution Rule 12: Storybook documentation required)
- [x] T010 [US2] Update `src/routes/market-regime/+page.svelte` — import `RegimeCardsGrid` and replace the inline grid `<div>` with `<RegimeCardsGrid regimes={sampleMarketRegimes} />`
- [x] T011 [US2] Run `pnpm check` and `pnpm lint` — verify no type or lint errors

**Checkpoint**: Market Regime page renders with both `MarketEnvironmentSummary` and `RegimeCardsGrid` organisms. Visual appearance unchanged. `pnpm check` passes.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that the page is a clean composition layer with no leftover inline markup.

- [x] T012 [P] Verify `src/routes/market-regime/+page.svelte` contains only the two organism imports and their invocations — no residual inline divs from the original implementation
- [ ] T013 Run dev server (`pnpm dev`) and navigate to `/market-regime` — confirm visual parity with the pre-refactor page (AI summary panel first, regime cards grid second, responsive layout intact)
- [x] T014 [P] Run `pnpm check` and `pnpm lint` final pass — confirm all CI gates pass locally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Schemas)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on T001 and T003 (MarketEnvironmentSummarySchema must be exported)
- **Phase 3 (US2)**: Depends on T002 and T003 (RegimeCardsGridSchema must be exported); can begin in parallel with Phase 2 after Phase 1 completes
- **Phase 4 (Polish)**: Depends on Phase 2 (T004–T007) and Phase 3 (T008–T011) both complete

### User Story Dependencies

- **US1** depends on: T001, T003
- **US2** depends on: T002, T003
- **US1 and US2** are independent of each other and can be implemented in parallel after Phase 1

### Within Each User Story

- Schema (Phase 1) → Organism component → Page update → Type check

### Parallel Opportunities

- T001 and T002 can run in parallel (different schema files)
- After Phase 1: T004 (US1 organism) and T008 (US2 organism) can run in parallel; T005 and T009 (Storybook stories) can also run in parallel
- T012 and T014 in Phase 4 can run in parallel

---

## Parallel Example: Phase 1

```
# Run in parallel:
Task T001: Create market-environment-summary.schema.ts
Task T002: Create regime-cards-grid.schema.ts
# Then:
Task T003: Update index.ts exports
```

## Parallel Example: After Phase 1

```
# Run in parallel:
Task T004: Create MarketEnvironmentSummary.svelte
Task T008: Create RegimeCardsGrid.svelte
# Then in parallel:
Task T005: Create MarketEnvironmentSummary.stories.svelte
Task T009: Create RegimeCardsGrid.stories.svelte
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Schemas (T001–T003)
2. Complete Phase 2: US1 organism (T004–T007)
3. **STOP and VALIDATE**: Navigate to `/market-regime` — confirm AI summary panel renders via organism
4. Proceed to Phase 3 (US2)

### Incremental Delivery

1. Phase 1 → both schemas ready
2. Phase 2 → `MarketEnvironmentSummary` organism + Storybook story live (MVP!)
3. Phase 3 → `RegimeCardsGrid` organism + Storybook story live
4. Phase 4 → cleanup and final CI verification

---

## Notes

- [P] tasks operate on different files with no shared dependencies
- [ZOD] tasks MUST precede organism component tasks (Constitution Rule 12)
- [STORYBOOK] label marks tasks that produce independently renderable components (verifiable in Storybook or browser without the full page)
- No new BDD feature files required — this refactor introduces no new user-observable behaviors (confirmed in research.md)
- No Docker changes required for this feature
- Commit after each phase checkpoint
