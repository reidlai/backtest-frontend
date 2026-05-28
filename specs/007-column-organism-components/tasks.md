# Tasks: Backtest Engine Column Organism Components

**Input**: Design documents from `specs/007-column-organism-components/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/component-props.md ✅, quickstart.md ✅

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file (`features/column-organism-components.feature`) was pre-created during planning. T001 verifies and finalizes it before any implementation tasks.

**Constitution Rule 12**: For each organism: state singleton → organism component → Storybook story → visual verification. Storybook verification is the checkpoint before advancing to the next user story or integration work.

---

## Phase 1: Setup

**Purpose**: Verify BDD feature file completeness before any implementation begins (Constitution Rule 6).

- [x] T001 [BDD] Verify `features/column-organism-components.feature` is complete — confirm all 13 scenarios are present, tagged `@organisms @backtest-engine @smoke`, and Given/When/Then syntax is valid (file pre-created in planning; this task confirms it is final and accurate)

---

## Phase 2: Foundational — Zod Schema Split

**Purpose**: Create the three per-organism Zod schemas that all state singletons and components depend on. MUST be complete before any user story implementation begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. T002–T004 can run in parallel; T005–T006 are sequential.

- [x] T002 [P] [ZOD] Create `src/lib/schemas/universe-capital-config.schema.ts` — define and export `BacktestModeSchema`, `BacktestMode` type, `UniverseCapitalConfigSchema` (fields: `mode`, `universe`, `initialCapital` with defaults from `BacktestStateSchema`), `UniverseCapitalConfig` type
- [x] T003 [P] [ZOD] Create `src/lib/schemas/schedule-execution-config.schema.ts` — define and export `ScheduleExecutionConfigSchema` (fields: `startDate`, `endDate`, `timeframe`, `direction` with defaults from `BacktestStateSchema`), `ScheduleExecutionConfig` type
- [x] T004 [P] [ZOD] Create `src/lib/schemas/order-types-config.schema.ts` — define and export `OrderTypeSchema`, `OrderType` type, `OrderTypesConfigSchema` (field: `selectedOrderTypes` as `z.array(OrderTypeSchema)` with default `['Market']`), `OrderTypesConfig` type
- [x] T005 Update `src/lib/schemas/index.ts` — add exports for all 6 identifiers from T002, T004 (`BacktestModeSchema`, `BacktestMode`, `UniverseCapitalConfigSchema`, `UniverseCapitalConfig`, `OrderTypeSchema`, `OrderType`) and 2 from T003 (`ScheduleExecutionConfigSchema`, `ScheduleExecutionConfig`); remove exports for `BacktestStateSchema`, `BacktestState`, `BacktestModeSchema`, `OrderTypeSchema` (depends on T002–T004)
- [x] T006 Delete `src/lib/schemas/backtest-state.schema.ts` — file is fully superseded by T002–T004; confirm no remaining imports reference it before deleting (depends on T005)

**Checkpoint**: Schema foundation ready — `pnpm check` should pass with no errors on schema files before proceeding.

---

## Phase 3: User Story 1 — Universe & Capital Organism (Priority: P1) 🎯 MVP

**Goal**: Extract the "Universe & Capital" column into a self-contained `UniverseCapitalConfig` organism with its own singleton state, independently renderable and Storybook-verified.

**Independent Test**: Mount `UniverseCapitalConfig` in Storybook — it must display default mode "Single Stock", universe "SPY", capital "100000" without any sibling organism state being present.

- [x] T007 [US1] Create `src/lib/state/universe-capital-config.svelte.ts` — define class `UniverseCapitalConfigState` with `$state` fields: `mode: BacktestMode`, `universe: string`, `initialCapital: string`; initialize from `UniverseCapitalConfigSchema.parse({})` defaults; implement `reset()` that re-parses defaults; export singleton `universeCapitalConfigState`
- [x] T008 [US1] Create `src/lib/components/organisms/UniverseCapitalConfig.svelte` — extract "Universe & Capital" column markup from `+page.svelte` (lines 42–64); replace `backtestState.*` bindings with `universeCapitalConfigState.*`; import `universeCapitalConfigState` and schema types; do NOT import `appState`, `scheduleExecutionConfigState`, or `orderTypesConfigState`
- [x] T009 [P] [US1] [STORYBOOK] Create `src/stories/UniverseCapitalConfig.stories.svelte` — follow `QuickActionsPanel.stories.svelte` pattern; define meta with `title: 'Organisms/UniverseCapitalConfig'`, `tags: ['autodocs']`; add `Default` story rendering the organism with no props
- [x] T010 [US1] Verify `UniverseCapitalConfig` in Storybook (`pnpm storybook`) — confirm Default story renders with correct defaults, mode dropdown is interactive, universe input accepts text, capital input accepts text, and no console errors appear (depends on T008, T009)

**Checkpoint**: `UniverseCapitalConfig` organism is independently functional and Storybook-verified. US1 complete.

---

## Phase 4: User Story 2 — Schedule & Execution Organism (Priority: P2)

**Goal**: Extract the "Schedule & Execution" column into a self-contained `ScheduleExecutionConfig` organism with its own singleton state, independently renderable and Storybook-verified.

**Independent Test**: Mount `ScheduleExecutionConfig` in Storybook — it must display default start date "2020-01-01", end date "2024-12-31", timeframe "Daily", direction "Long" without any sibling organism state being present.

- [x] T011 [US2] Create `src/lib/state/schedule-execution-config.svelte.ts` — define class `ScheduleExecutionConfigState` with `$state` fields: `startDate: string`, `endDate: string`, `timeframe: string`, `direction: 'Long' | 'Short' | 'Both'`; initialize from `ScheduleExecutionConfigSchema.parse({})` defaults; implement `reset()`; export singleton `scheduleExecutionConfigState`
- [x] T012 [US2] Create `src/lib/components/organisms/ScheduleExecutionConfig.svelte` — extract "Schedule & Execution" column markup from `+page.svelte` (lines 67–102); replace `backtestState.*` bindings with `scheduleExecutionConfigState.*`; import `scheduleExecutionConfigState` and schema types; do NOT import `appState` or sibling organism state
- [x] T013 [P] [US2] [STORYBOOK] Create `src/stories/ScheduleExecutionConfig.stories.svelte` — `title: 'Organisms/ScheduleExecutionConfig'`, `tags: ['autodocs']`; add `Default` story rendering the organism with no props
- [x] T014 [US2] Verify `ScheduleExecutionConfig` in Storybook — confirm Default story renders with correct defaults, date inputs accept input, timeframe dropdown is interactive, direction dropdown is interactive, no console errors (depends on T012, T013)

**Checkpoint**: `ScheduleExecutionConfig` organism is independently functional and Storybook-verified. US2 complete.

---

## Phase 5: User Story 3 — Order Types Organism (Priority: P3)

**Goal**: Extract the "Order Types" column into a self-contained `OrderTypesConfig` organism with its own singleton state and an `onRun` callback prop, independently renderable and Storybook-verified.

**Independent Test**: Mount `OrderTypesConfig` in Storybook (Default story — no `onRun`) — checkboxes render for all 8 order types, "Market" is checked by default, Run Backtest button is present; mounting with a mock `onRun` prop triggers the callback on button click.

- [x] T015 [US3] Create `src/lib/state/order-types-config.svelte.ts` — define class `OrderTypesConfigState` with `selectedOrderTypes = new SvelteSet<OrderType>(OrderTypesConfigSchema.parse({}).selectedOrderTypes as OrderType[])`; implement `reset()` that clears the set and re-populates from `OrderTypesConfigSchema.parse({}).selectedOrderTypes`; export singleton `orderTypesConfigState`
- [x] T016 [US3] Create `src/lib/components/organisms/OrderTypesConfig.svelte` — extract "Order Types" column markup from `+page.svelte` (lines 104–128); accept `onRun` prop via Svelte 5 `$props()` with default `() => {}`; replace `backtestState.selectedOrderTypes` bindings with `orderTypesConfigState.selectedOrderTypes`; wire Run Backtest button `onclick` to `onRun`; do NOT import sibling organism state or `appState`
- [x] T017 [P] [US3] [STORYBOOK] Create `src/stories/OrderTypesConfig.stories.svelte` — `title: 'Organisms/OrderTypesConfig'`, `tags: ['autodocs']`; add `Default` story (no `onRun` prop) and `WithRunHandler` story passing a mock `onRun` callback that logs to console
- [x] T018 [US3] Verify `OrderTypesConfig` in Storybook — confirm Default story shows all 8 checkboxes with "Market" checked, button click is a no-op; confirm WithRunHandler story triggers mock callback on button click; no console errors in either story (depends on T016, T017)

**Checkpoint**: `OrderTypesConfig` organism is independently functional and Storybook-verified. US3 complete.

---

## Phase 6: Polish & Integration

**Purpose**: Wire all three organisms into the backtest engine page, update `QuickActionsPanel`, remove the legacy `backtestState` singleton, and confirm full regression-free behaviour.

- [x] T019 Update `src/routes/backtest-engine/+page.svelte` — import `UniverseCapitalConfig`, `ScheduleExecutionConfig`, `OrderTypesConfig`; import `universeCapitalConfigState`, `scheduleExecutionConfigState`, `orderTypesConfigState`; replace three inline column `<div>` blocks with `<UniverseCapitalConfig />`, `<ScheduleExecutionConfig />`, `<OrderTypesConfig onRun={handleRun} />`; update `$effect` to write `appState.backtestPrefillSymbol` to `universeCapitalConfigState.universe`; rewrite `handleRun` to read from all three singletons; remove `import { backtestState }` (depends on T010, T014, T018)
- [x] T020 Update `src/lib/components/organisms/QuickActionsPanel.svelte` — remove `import { backtestState }`; add imports for `universeCapitalConfigState`, `scheduleExecutionConfigState`, `orderTypesConfigState`; update reset action to call `reset()` on all three singletons (depends on T007, T011, T015)
- [x] T021 Delete `src/lib/state/backtest.svelte.ts` — confirm no remaining imports reference `backtestState` before deleting (depends on T019, T020)
- [x] T022 [P] Run `pnpm check` — verify zero TypeScript errors across all modified and new files (depends on T019–T021)
- [x] T023 [P] Run `pnpm lint` — verify zero ESLint and Prettier formatting errors (depends on T019–T021)
- [x] T024 Run `pnpm test:unit` — verify all existing unit tests pass; fix any regressions from removed `backtestState` references (depends on T022)
- [x] T025 Run `pnpm test:e2e` — verify `features/column-organism-components.feature` BDD scenarios pass and no existing e2e tests regress (depends on T024)
- [x] T026 Manual visual verification — load `/backtest-engine` in dev server (`pnpm dev`); confirm all three columns render with correct defaults, form fields are interactive, "Run Backtest" triggers toast, Quick Actions Panel reset clears all columns (depends on T025)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS** all user story phases
- **Phase 3 (US1 P1)**: Depends on Phase 2 (schemas ready) — no dependency on US2/US3
- **Phase 4 (US2 P2)**: Depends on Phase 2 — no dependency on US1/US3
- **Phase 5 (US3 P3)**: Depends on Phase 2 — no dependency on US1/US2
- **Phase 6 (Polish)**: Depends on Phase 3 + Phase 4 + Phase 5 all complete

### User Story Dependencies

- **US1 (T007–T010)**: Can start after Phase 2 — no dependencies on US2 or US3
- **US2 (T011–T014)**: Can start after Phase 2 — no dependencies on US1 or US3
- **US3 (T015–T018)**: Can start after Phase 2 — no dependencies on US1 or US2

### Within Each User Story

- State singleton (T007/T011/T015) → Organism component (T008/T012/T016) → Storybook story (T009/T013/T017) → Storybook verification (T010/T014/T018)
- [P] tasks (Storybook stories T009, T013, T017) can be written in parallel while the component is being built, but verification requires the component to exist

### Parallel Opportunities

- **Phase 2**: T002, T003, T004 can run in parallel (different schema files)
- **Phase 3/4/5**: All three user story phases can run in parallel once Phase 2 is complete (different files throughout)
- **Phase 6**: T022 and T023 can run in parallel after T019–T021

---

## Parallel Example: After Phase 2 (3 developers)

```bash
# Developer A works on US1:
T007 → T008 → T009 (parallel with T008) → T010

# Developer B works on US2:
T011 → T012 → T013 (parallel with T012) → T014

# Developer C works on US3:
T015 → T016 → T017 (parallel with T016) → T018

# All converge on Phase 6 after T010, T014, T018 complete
T019 → T020 → T021 → T022 + T023 (parallel) → T024 → T025 → T026
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Schema split (T002–T006)
3. Complete Phase 3: US1 — Universe & Capital (T007–T010)
4. **STOP and VALIDATE**: `UniverseCapitalConfig` renders in Storybook with correct defaults
5. Optionally: wire just US1 into `+page.svelte` temporarily to confirm integration works

### Incremental Delivery

1. Phase 1 + 2 → schema foundation ready
2. Phase 3 (US1) → Universe & Capital organism complete and Storybook-verified
3. Phase 4 (US2) → Schedule & Execution organism complete and Storybook-verified
4. Phase 5 (US3) → Order Types organism complete and Storybook-verified
5. Phase 6 → Page integration, legacy removal, final validation

### Parallel Team Strategy

With multiple developers, Phase 3/4/5 can proceed simultaneously after Phase 2. Phase 6 is a sequential convergence point.

---

## Notes

- `[P]` tasks operate on different files with no blocking dependencies — safe to run in parallel
- `[US#]` label maps each task to a specific user story for independent traceability
- `[BDD]` task (T001) MUST be verified complete before any implementation — Constitution Rule 6
- `[ZOD]` tasks (T002–T004) MUST precede organism component implementation — schemas define defaults
- `[STORYBOOK]` tasks (T009, T013, T017) verify organism visual correctness independently before page integration — Constitution Rule 12
- T006 and T021 (file deletions) MUST happen AFTER all import sites are updated and TypeScript confirms no remaining references
- Commit after each phase checkpoint minimum; commit after each task preferred
