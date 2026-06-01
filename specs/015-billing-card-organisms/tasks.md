---
description: 'Task list for Billing Card Organisms feature'
---

# Tasks: Billing Card Organisms

**Input**: Design documents from `/specs/015-billing-card-organisms/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file task appears in Phase 1 and precedes all organism implementation tasks.

---

## Phase 1: Setup & BDD Feature File

**Purpose**: Create the BDD feature file (Rule 6 — MUST precede implementation) and update the existing organism-count BDD scenario.

- [x] T001 [BDD] Create BDD feature file `features/billing-card-organisms.feature` — tag with @smoke and @zod-schemas covering all three organism acceptance scenarios (valid render, fallback on invalid data, 100% progress edge case); add corresponding step definitions in `features/step-definitions/` for schema validation scenarios (satisfies Constitution Rule 6 for behavioral coverage of FR-002/FR-003/FR-004)
- [x] T002 [P] Update organism and schema count in `features/zod-schema-organisms.feature` — increment organism count from 30 to 33 and schema count accordingly

---

## Phase 2: Foundational (Zod Schemas — Blocking)

**Purpose**: Zod schemas MUST exist before organism components can be built (Rule 12 — schema before implementation).

**⚠️ CRITICAL**: No organism implementation can begin until schemas are complete and exported.

- [x] T003 [ZOD] [P] Create `src/lib/schemas/token-usage-card.schema.ts` — export `TokenUsageCardSchema` with fields `tokensUsed` and `tokensTotal` (non-negative ints, refine used ≤ total, defaults 0/10000)
- [x] T004 [ZOD] [P] Create `src/lib/schemas/backtest-runs-card.schema.ts` — export `BacktestRunsCardSchema` with fields `backtestsUsed`, `backtestsTotal` (non-negative ints, refine used ≤ total), `planName` (non-empty string, default 'Pro Plan')
- [x] T005 [ZOD] [P] Create `src/lib/schemas/system-status-card.schema.ts` — export `SystemStatusCardSchema` with fields `queuePosition` (non-negative int), `complexityScore` (0–100), `estimatedRuntime` (non-empty string)
- [x] T006 Add three new barrel exports to `src/lib/schemas/index.ts` — `token-usage-card.schema`, `backtest-runs-card.schema`, `system-status-card.schema`
- [x] T007 [P] Create schema unit tests in `src/lib/schemas/__tests__/billing-card-organisms.schema.test.ts` — test valid parse, refine violations, and `.parse({})` default values for all three schemas

**Checkpoint**: `pnpm check` passes; schemas export from `$lib/schemas`; unit tests green.

---

## Phase 3: User Story 1 — Token Usage Organism (Priority: P1) 🎯 MVP

**Goal**: Self-contained Token Usage card organism with local `$state`, schema validation, and Storybook story.

**Independent Test**: Mount `TokenUsageCard` in Storybook with valid and invalid props; verify progress bar renders correctly and invalid data shows fallback.

### Implementation for User Story 1

- [x] T008 [STORYBOOK] [US1] Create `src/stories/TokenUsageCard.stories.svelte` — two stories: default valid data and invalid/schema-failing data showing fallback state
- [x] T009 [US1] Create `src/lib/components/organisms/TokenUsageCard.svelte` — import `TokenUsageCardSchema`, hold `$state` from `Schema.parse(props)` with try/catch fallback, render Card with title, progress bar, and daily reset note; accept `tokensUsed` and `tokensTotal` as props

**Checkpoint**: `TokenUsageCard` renders in Storybook without console errors; valid data shows progress bar at correct percentage; invalid/schema-failing data shows fallback message (SC-001, SC-002).

---

## Phase 4: User Story 2 — Backtest Runs Organism (Priority: P2)

**Goal**: Self-contained Backtest Runs card organism with plan name display, schema validation, and Storybook story.

**Independent Test**: Mount `BacktestRunsCard` in Storybook with valid data including plan name and with missing/invalid fields; verify plan badge and progress bar render correctly.

### Implementation for User Story 2

- [x] T010 [STORYBOOK] [US2] Create `src/stories/BacktestRunsCard.stories.svelte` — stories for valid data with plan name, zero runs used, and schema-failing data
- [x] T011 [US2] Create `src/lib/components/organisms/BacktestRunsCard.svelte` — import `BacktestRunsCardSchema`, hold `$state` from `Schema.parse(props)` with try/catch fallback, render Card with title, runs progress bar, and bold plan name in footer; accept `backtestsUsed`, `backtestsTotal`, `planName` as props

**Checkpoint**: `BacktestRunsCard` renders in Storybook without console errors; plan name displays correctly; invalid data shows fallback message (SC-001, SC-002).

---

## Phase 5: User Story 3 — System Status Organism (Priority: P3)

**Goal**: Self-contained System Status card organism with metric rows, schema validation, and Storybook story.

**Independent Test**: Mount `SystemStatusCard` in Storybook with full and partial data; verify each metric row renders and schema-failing data shows fallback.

### Implementation for User Story 3

- [x] T012 [STORYBOOK] [US3] Create `src/stories/SystemStatusCard.stories.svelte` — stories for valid full data, and schema-failing data (complexityScore out of range)
- [x] T013 [US3] Create `src/lib/components/organisms/SystemStatusCard.svelte` — import `SystemStatusCardSchema`, hold `$state` from `Schema.parse(props)` with try/catch fallback, render Card with title and three labeled metric rows (Queue Position, Complexity Score, Estimated Runtime); accept `queuePosition`, `complexityScore`, `estimatedRuntime` as props

**Checkpoint**: All three organisms are independently renderable in Storybook without console errors; schema-failing data shows fallback in each (SC-001, SC-002).

---

## Phase 6: Page Integration & Polish

**Purpose**: Wire the three organisms into the billing page and verify visual parity with the pre-refactor state.

- [x] T014 Update `src/routes/setting-billing/+page.svelte` — replace all three inline Card blocks with `<TokenUsageCard>`, `<BacktestRunsCard>`, and `<SystemStatusCard>` organism imports; pass `sampleResourceUsage` fields as props; pass `planName="Pro Plan"` hardcoded for now
- [x] T015 [P] Run `pnpm check` and resolve any TypeScript errors — verify zero type errors across all new files
- [x] T016 [P] Run `pnpm lint` and apply any formatting fixes to new files in `src/lib/schemas/`, `src/lib/components/organisms/`, and `src/stories/`
- [x] T017 Manually verify `setting-billing` page in dev server — confirm visual output is identical to pre-refactor (grid layout, progress bars, plan name, system status rows)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (BDD)**: No dependencies — start immediately
- **Phase 2 (Schemas)**: Depends on Phase 1 — blocks Phases 3–5
- **Phase 3 (US1)**: Depends on Phase 2 (T003, T006)
- **Phase 4 (US2)**: Depends on Phase 2 (T004, T006) — independent of Phase 3
- **Phase 5 (US3)**: Depends on Phase 2 (T005, T006) — independent of Phases 3–4
- **Phase 6 (Integration)**: Depends on Phases 3, 4, 5 all complete

### User Story Dependencies

- **US1 (P1)**: Blocked only by T003 + T006
- **US2 (P2)**: Blocked only by T004 + T006 — can run in parallel with US1
- **US3 (P3)**: Blocked only by T005 + T006 — can run in parallel with US1 and US2

### Within Each User Story

- [BDD] task (T001) MUST be written before any organism implementation (T009, T011, T013)
- [STORYBOOK] task MUST precede organism `.svelte` implementation task within each story
- Schema tasks MUST precede organism tasks

### Parallel Opportunities

- T003, T004, T005 (schema creation) — all different files, run in parallel
- T007 (schema tests) — can start as soon as T003–T005 complete
- T008 (Storybook US1) + T010 (Storybook US2) + T012 (Storybook US3) — parallel after T006
- T009 (organism US1) + T011 (organism US2) + T013 (organism US3) — parallel after their respective Storybook tasks
- T015, T016 — parallel after T014

---

## Parallel Example: Schema Phase (Phase 2)

```
# All three schemas in parallel (different files):
Task T003: Create token-usage-card.schema.ts
Task T004: Create backtest-runs-card.schema.ts
Task T005: Create system-status-card.schema.ts

# Then sequential:
Task T006: Update index.ts barrel exports
Task T007: Write schema unit tests
```

## Parallel Example: Organism Phases (Phases 3–5)

```
# Once T006 is done, all three organism stories can start in parallel:
Task T008: TokenUsageCard.stories.svelte
Task T010: BacktestRunsCard.stories.svelte
Task T012: SystemStatusCard.stories.svelte

# Then organisms in parallel (each depends only on its own story):
Task T009: TokenUsageCard.svelte   (after T008)
Task T011: BacktestRunsCard.svelte (after T010)
Task T013: SystemStatusCard.svelte (after T012)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (BDD feature file)
2. Complete Phase 2, T003 + T006 only (TokenUsageCard schema + export)
3. Complete Phase 3 (T008 + T009)
4. **STOP and VALIDATE**: Storybook shows TokenUsageCard working
5. Continue with Phases 4–6

### Incremental Delivery

1. Phase 1 + Phase 2 → schemas green, BDD file in place
2. Phase 3 (US1) → TokenUsageCard independently usable
3. Phase 4 (US2) → BacktestRunsCard independently usable
4. Phase 5 (US3) → SystemStatusCard independently usable
5. Phase 6 → page integrated, visual parity confirmed

---

## Notes

- [P] tasks = different files, no blocking dependencies between them
- [US1/US2/US3] label maps each task to its user story for traceability
- [BDD] tasks (Constitution Rule 6) precede all implementation tasks
- [STORYBOOK] tasks (Constitution Rule 12) precede their organism implementation tasks
- [ZOD] tasks produce schemas that are the source of truth for organism state
- No new npm dependencies are introduced; Zod is already installed
- `planName` is passed as a hardcoded `"Pro Plan"` prop from the page for this feature; dynamic plan data is out of scope
