# Tasks: Fundamental Screener Organism Refactor

**Input**: Design documents from `specs/008-screener-organism-refactor/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file tasks appear in Phase 1 and precede all implementation tasks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup & BDD (Shared Infrastructure)

**Purpose**: BDD feature file first (Rule 6), plus schema foundation used by both organisms.

- [x] T001 [BDD] Create BDD feature file `features/screener-organism-refactor.feature` with all Given/When/Then scenarios from spec.md tagged @smoke and @screener (Constitution Rule 6 — MUST precede all implementation tasks)
- [x] T001b [BDD] Create/update step definitions in `features/step-definitions/` for `screener-organism-refactor.feature` — add atomic steps for: filter controls visible, snapshot capture/restore navigation flow, table row rendering, and backtest button callback (reuse existing navigation/visibility steps where possible)
- [x] T002 [ZOD] Create Zod schema file `src/lib/schemas/screener-filter-panel.schema.ts` re-exporting `FundamentalScreenerSchema` as canonical organism schema
- [x] T003 Export new schema from `src/lib/schemas/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No user story can be implemented until the BDD feature file and schema are in place (Phase 1 complete).

**⚠️ CRITICAL**: Phase 1 must be complete before any organism work begins.

*(No additional foundational infrastructure required — existing SvelteKit, shadcn-svelte, Zod and shared-mockdata are already in place.)*

---

## Phase 3: User Story 1 — Filter Controls as Reusable Component (Priority: P1) 🎯 MVP

**Goal**: Extract the four-control filter block into `ScreenerFilterPanel` organism with internal state and owned snapshot.

**Independent Test**: Render `ScreenerFilterPanel` in isolation in Storybook — all four controls visible with defaults. Navigate away and back in the running app — filter values restored.

### Implementation for User Story 1

- [x] T004 [US1] Create `src/lib/components/organisms/ScreenerFilterPanel.svelte` — internal `$state` initialised from `FundamentalScreenerSchema.parse({})`, renders Universe Select + PE/ROIC/RevGrowth Inputs with existing Tailwind classes from `+page.svelte` filter block
- [x] T005 [US1] Add `export const snapshot: Snapshot` inside the `<script module>` block of `src/lib/components/organisms/ScreenerFilterPanel.svelte` — `capture()` returns current state object; `restore(value)` calls `FundamentalScreenerSchema.safeParse(value)` and applies all four fields on success (module script, not instance script — required for SvelteKit snapshot re-export to work)
- [x] T006 [STORYBOOK] Create `src/stories/ScreenerFilterPanel.stories.svelte` using `defineMeta` / `@storybook/addon-svelte-csf` with Default story (Constitution Rule 12 — verify component in Storybook)
- [x] T007 [US1] Update `src/routes/fundamental-screener/+page.svelte` — import `ScreenerFilterPanel`, re-export its snapshot in module script (`export { snapshot } from '$lib/components/organisms/ScreenerFilterPanel.svelte'`), replace inline filter block `<div>` with `<ScreenerFilterPanel />`

**Checkpoint**: `ScreenerFilterPanel` renders correctly in Storybook. Snapshot restore works in the running app. Page script block contains no filter state variables.

---

## Phase 4: User Story 2 — Results Table as Reusable Component (Priority: P2)

**Goal**: Extract the results table into `ScreenerResultTable` organism that accepts an `onBacktest` callback prop.

**Independent Test**: Render `ScreenerResultTable` in isolation in Storybook — all 10 columns visible with sample rows. Clicking Backtest triggers the callback.

### Implementation for User Story 2

- [x] T008 [US2] Create `src/lib/components/organisms/ScreenerResultTable.svelte` — declares `onBacktest: (symbol: string) => void` prop via `$props()`, renders Table with header and `{#each sampleScreenerResults as result}` body using `ScreenerResultRow` molecule, passing `result` and `onBacktest`
- [x] T009 [STORYBOOK] Create `src/stories/ScreenerResultTable.stories.svelte` — stub `goto` at module level (no-op), provide a no-op `onBacktest` prop in Default story (Constitution Rule 12)
- [x] T010 [US2] Update `src/routes/fundamental-screener/+page.svelte` — import `ScreenerResultTable`, replace inline results `<div>` with `<ScreenerResultTable onBacktest={handleBacktest} />`, ensure `handleBacktest` remains on page for navigation

**Checkpoint**: `ScreenerResultTable` renders correctly in Storybook with all rows and columns. Backtest callback fires. Page template contains no inline Table markup. Verify `src/routes/fundamental-screener/+page.svelte` has no import of `sampleScreenerResults` (removed as part of T010). Verify `ScreenerResultTable.svelte` imports `sampleScreenerResults` from `$lib/shared-mockdata/market` internally.

---

## Phase 5: CD Post-Deploy Coverage, Local Lint/Type-Check & Final Page Structure Verification

**Purpose**: Create the Playwright E2E smoke test for CD post-deploy consumption, run local lint/type-check, and do final manual verification. **E2E tests MUST NOT be added to `ci.yaml`** — they belong to the `cd-smoke-tests` CD gate (Constitution Rule 7).

- [x] T011 [P] Create `e2e-tests/screener-organism-refactor.e2e.ts` — Playwright test: load `/fundamental-screener`, assert filter controls visible, assert table rows visible, assert Backtest button navigates to `/backtest-engine`. **⚠️ CD ONLY: this file MUST NOT be wired into `ci.yaml`. It is consumed by the `cd-smoke-tests` post-deploy gate per Constitution Rule 7.**
- [x] T012 [P] [AUTO] Run `pnpm check` (TypeScript type-check) and `pnpm lint` — fix any type errors from snapshot re-export or prop declarations
- [ ] T013 [MANUAL] Manually verify snapshot: navigate from screener → another page → back; confirm filter values restored
- [ ] T014 [P] [MANUAL] Run Storybook (`pnpm storybook`) — confirm `ScreenerFilterPanel` and `ScreenerResultTable` stories render without errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup & BDD)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — Phase 1 is trivially fast; proceed sequentially
- **Phase 3 (US1 — Filter)**: Depends on Phase 1 complete (schema + BDD file ready)
- **Phase 4 (US2 — Results)**: Depends on Phase 1 complete; independent of Phase 3 (different files)
- **Phase 5 (Polish)**: Depends on Phases 3 and 4 complete

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 1
- **US2 (P2)**: Independent after Phase 1; can run in parallel with US1 (different component files)
- **US3 (P3)**: Collapsed into US2 Phase 4 checkpoint — verified as part of T010 completion

### Within Each User Story

- BDD file (T001) MUST be written before any implementation task
- Schema (T002, T003) before organism implementation
- Component creation before Storybook story before page update
- Storybook verification before marking story complete

### Parallel Opportunities

- T004 (ScreenerFilterPanel) and T008 (ScreenerResultTable) can run in parallel (different files)
- T006 (Filter Storybook) and T009 (Result Storybook) can run in parallel
- T011, T012, T014 (Polish phase) can all run in parallel

---

## Parallel Example: US1 + US2 Simultaneously

```
# After Phase 1 is complete, run US1 and US2 in parallel:
Agent A: T004 → T005 → T006 → T007  (ScreenerFilterPanel + page update)
Agent B: T008 → T009 → T010         (ScreenerResultTable + page update)
# T007 and T010 both touch +page.svelte — coordinate to avoid conflicts
```

**Note**: T007 and T010 both modify `+page.svelte`. If run in parallel, coordinate the edits or do them sequentially.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001, T002, T003
2. Complete Phase 3: T004 → T005 → T006 → T007
3. **STOP and VALIDATE**: Storybook renders, snapshot works, page is thinner
4. Proceed to US2 (Phase 4)

### Incremental Delivery

1. Phase 1 → Foundation (BDD + schema + step definitions)
2. Phase 3 → Filter organism extracted and verified (MVP)
3. Phase 4 → Result organism extracted and verified (includes US3 data import check)
4. Phase 5 → E2E, lint, type-check green

---

## Notes

- [P] tasks operate on different files with no blocking dependencies
- [BDD] task (T001) is non-negotiable per Constitution Rule 6 — write before any implementation
- [STORYBOOK] tasks (T006, T009) satisfy Constitution Rule 12 — UI components verified in Storybook
- [ZOD] task (T002) follows Constitution Rule 12 schema-first workflow
- Snapshot re-export (`export { snapshot }` in page module script) is the key SvelteKit pattern — see `research.md` for details
- Both organism Storybook stories need no-op stubs only for `ScreenerResultTable` (which uses `onBacktest`); `ScreenerFilterPanel` needs no stubs
