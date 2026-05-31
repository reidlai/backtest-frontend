# Tasks: Strategy Builder Input and Output Panels

**Input**: Design documents from `specs/011-strategy-builder-panels/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file tasks appear in Phase 1 and MUST precede any implementation tasks for the behaviors they describe. Feature file lives in `features/` and is tagged `@smoke` and `@strategy-builder`.

---

## Phase 1: Setup & BDD (Shared Infrastructure)

**Purpose**: BDD feature file first (Rule 6), then shared Zod schemas and state extensions that all user stories depend on.

- [x] T001 [BDD] Create BDD feature file for strategy builder panels in `features/strategy-builder-panels.feature` — tag with @smoke and @strategy-builder; cover US1 (Input Panel renders + Run button), US2 (Output Panel states), US3 (side-by-side layout) (Constitution Rule 6 — MUST precede implementation)
- [x] T002 [P] [ZOD] Create `StrategyInputPanelSchema` in `src/lib/schemas/strategy-input-panel.schema.ts` — fields: `inputText` (string), `isRunning` (boolean, default false), `onRun` (function)
- [x] T003 [P] [ZOD] Create `StrategyOutputPanelSchema` in `src/lib/schemas/strategy-output-panel.schema.ts` — fields: `result` (BacktestResult | null), `isLoading` (boolean, default false), `error` (string | null)
- [x] T004 Extend `StrategyState` class in `src/lib/state/strategy.svelte.ts` — add `isRunning = $state<boolean>(false)`, `backtestResult = $state<BacktestResult | null>(null)`, `runError = $state<string | null>(null)`, and `reset()` update to clear new fields; import `BacktestResultSchema` type
- [x] T005 Export new schemas from `src/lib/schemas/index.ts` — add `StrategyInputPanelSchema` and `StrategyOutputPanelSchema`

**Checkpoint**: BDD feature file written and reviewed; schemas created and exported; state extended — all user story implementation can now begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core organism scaffolding that both US1 and US2 depend on before Storybook verification.

- [x] T006 Create `StrategyInputPanel.svelte` scaffold in `src/lib/components/organisms/StrategyInputPanel.svelte` — accept props matching `StrategyInputPanelSchema`; render empty shell with correct prop types; no logic yet
- [x] T007 [P] Create `StrategyOutputPanel.svelte` scaffold in `src/lib/components/organisms/StrategyOutputPanel.svelte` — accept props matching `StrategyOutputPanelSchema`; render empty shell with correct prop types; no logic yet

**⚠️ CRITICAL**: Storybook stories (Phase 3, US1) MUST be verified before logic is wired (Constitution Rule 12)

**Checkpoint**: Both organism shells compile without errors; props are typed correctly

---

## Phase 3: User Story 1 — Configure Strategy Inputs (Priority: P1) 🎯 MVP

**Goal**: The Input Panel organism renders on the Strategy Builder page with a textarea, inline validation, and a "Run" button that triggers async backtest execution.

**Independent Test**: Load `/strategy-builder`; verify Input Panel is visible with textarea and disabled Run button; type <10 chars and check inline error; type ≥10 chars and verify Run button enables; click Run and verify button disables during run.

### Implementation for User Story 1

- [x] T008 [P] [STORYBOOK] Create `StrategyInputPanel.stories.svelte` in `src/stories/StrategyInputPanel.stories.svelte` — stories: Default (empty, Run disabled), ValidationError (touched + <10 chars, error shown), Valid (≥10 chars, Run enabled), Running (isRunning=true, button disabled); rendering this organism in Storybook without StrategyOutputPanel mounted satisfies FR-007 (independent renderability) (Constitution Rule 12 — MUST precede wiring)
- [x] T009 Verify all four `StrategyInputPanel` Storybook stories in Storybook before proceeding to T010 — pass criteria: no browser console errors; all four story names (Default, ValidationError, Valid, Running) visible in sidebar; Run button visually disabled in Default/ValidationError/Running stories; inline error text visible in ValidationError story
- [x] T010 [US1] Implement textarea binding and inline validation in `src/lib/components/organisms/StrategyInputPanel.svelte` — bind `inputText`; track touched state; show inline error "Strategy description must be at least 10 characters" when touched and `inputText.length < 10`; disable Run button when `inputText.length < 10` or `isRunning === true`
- [x] T011 [US1] Wire "Run" button click handler in `src/lib/components/organisms/StrategyInputPanel.svelte` — call `onRun()` prop on valid click; add loading indicator to button when `isRunning === true`
- [x] T012 [US1] Update `src/routes/strategy-builder/+page.svelte` — import `StrategyInputPanel`; pass `strategyState.inputText`, `strategyState.isRunning`, and `onRun` handler; remove inline textarea and Parse button markup

**Checkpoint**: User Story 1 fully functional — Input Panel renders, validates, and Run button works independently of Output Panel

---

## Phase 4: User Story 2 — View Strategy Results (Priority: P2)

**Goal**: The Output Panel organism displays performance metrics, equity curve chart, and trade summary table when results are available; shows empty, loading, and error states correctly.

**Independent Test**: Provide mock `BacktestResult` to Output Panel via Storybook; verify metric tiles show correct values; equity curve chart renders; trade table shows rows. Verify loading skeleton renders when `isLoading=true`. Verify error message renders when `error` is non-null.

### Implementation for User Story 2

- [x] T013 [P] [STORYBOOK] Create `StrategyOutputPanel.stories.svelte` in `src/stories/StrategyOutputPanel.stories.svelte` — stories: Empty (result=null, isLoading=false), Loading (isLoading=true), Result (result=sampleBacktestResult), Error (error="Backtest failed: invalid strategy"); rendering this organism in Storybook without StrategyInputPanel mounted satisfies FR-007 (independent renderability); create `sampleBacktestResult` inline in the story if no existing mock exists (Constitution Rule 12 — MUST precede wiring)
- [x] T014 Verify all four `StrategyOutputPanel` Storybook stories in Storybook before proceeding to T015 — pass criteria: no browser console errors; all four story names (Empty, Loading, Result, Error) visible in sidebar; Empty story shows dashed placeholder; Loading story shows skeleton elements; Result story shows metric tiles + chart area + table rows; Error story shows inline error message
- [x] T015 [P] [US2] Implement empty state in `src/lib/components/organisms/StrategyOutputPanel.svelte` — dashed border placeholder with instructional text when `result === null && !isLoading && error === null`
- [x] T016 [P] [US2] Implement loading state in `src/lib/components/organisms/StrategyOutputPanel.svelte` — skeleton placeholders for metric section, chart area, and table when `isLoading === true`
- [x] T017 [P] [US2] Implement error state in `src/lib/components/organisms/StrategyOutputPanel.svelte` — inline error message card showing `error` string when `error !== null && !isLoading`
- [x] T018 [US2] Implement performance metrics section in `src/lib/components/organisms/StrategyOutputPanel.svelte` (depends on T015–T017) — render 5 metric tiles (Total Return, Sharpe Ratio, Max Drawdown, Win Rate, Profit Factor) using `result` fields; reuse existing `MetricTile` molecule from `src/lib/components/molecules/MetricTile.svelte`
- [x] T019 [US2] Implement equity curve chart section in `src/lib/components/organisms/StrategyOutputPanel.svelte` — render line chart of `result.equityCurve` using `layerchart`; x-axis: date, y-axis: portfolio value
- [x] T020 [US2] Implement trade summary table section in `src/lib/components/organisms/StrategyOutputPanel.svelte` — render table with columns: Symbol, Direction, Entry Date, Exit Date, Net P&L, Return % using shadcn `Table` primitives; import `sampleTrades` from `$lib/shared-mockdata/trades` as the data source (`BacktestResultSchema` does not include a trades array; backend integration is out of scope for this iteration)
- [x] T021 [US2] Update `src/routes/strategy-builder/+page.svelte` — import `StrategyOutputPanel`; pass `strategyState.backtestResult` as `result`, `strategyState.isRunning` as `isLoading`, `strategyState.runError` as `error`; remove inline output markup
- [x] T022 [US2] Implement `onRun` handler in `src/routes/strategy-builder/+page.svelte` — set `strategyState.isRunning = true`, clear `strategyState.runError`; call mock parse/run (existing `handleParse` logic adapted); on success set `strategyState.backtestResult` and `strategyState.isRunning = false`; on failure set `strategyState.runError` and `strategyState.isRunning = false`

**Checkpoint**: User Stories 1 AND 2 fully functional — Input Panel runs and Output Panel displays all four states correctly

---

## Phase 5: User Story 3 — Side-by-Side Layout (Priority: P3)

**Goal**: Both panels are visible side-by-side on desktop viewports and stack vertically on tablet viewports without content loss.

**Independent Test**: Load `/strategy-builder` at 1280px width — verify both panels visible side-by-side. Resize to 768px — verify panels stack vertically without overflow or clipping.

### Implementation for User Story 3

- [x] T023 [US3] Apply responsive two-column grid layout in `src/routes/strategy-builder/+page.svelte` — use `grid gap-6 lg:grid-cols-2` (matching existing page grid pattern); verify Input Panel occupies left column and Output Panel occupies right column at lg+ breakpoints; verify single-column stacking at md and below
- [x] T024 [US3] Verify layout at 768px, 1024px, 1280px, and 1920px viewport widths in Storybook or browser — no content overflow, clipping, or panel overlap at any tested width

**Checkpoint**: All three user stories independently functional; side-by-side layout verified across breakpoints

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, CI readiness, and cleanup.

- [x] T025 [P] Run `pnpm lint` and fix any TypeScript or ESLint errors introduced by new organisms and state fields
- [x] T026 Run Storybook build (`pnpm build-storybook`) and confirm no story compilation errors
- [x] T027 Wire BDD step definitions in `features/step-definitions/` for all @smoke scenarios in `features/strategy-builder-panels.feature`; run `pnpm cucumber` locally and confirm all @smoke scenarios pass before raising a PR (Constitution Rule 6)
- [x] T028 Run quickstart.md validation — confirm `pnpm dev` starts without error and `/strategy-builder` page loads with both organisms visible; open browser DevTools Performance tab, trigger a Run with mock data, and confirm the Output Panel result render completes within 1 second (SC-003)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup & BDD)**: No dependencies — start immediately; T002 and T003 are parallel
- **Phase 2 (Foundational)**: Depends on T002, T003 (schemas must exist before scaffolding); T006 and T007 are parallel
- **Phase 3 (US1)**: Depends on Phase 2 complete — T008 (Storybook) → T009 (verify) → T010–T011 (logic) → T012 (page wiring)
- **Phase 4 (US2)**: Depends on Phase 2 complete; can start T013–T017 in parallel with Phase 3 T008–T011; T018–T020 depend on T015–T017; T021–T022 depend on T018–T020
- **Phase 5 (US3)**: Depends on T012 and T021 (both organisms wired into page)
- **Phase 6 (Polish)**: Depends on all prior phases complete

### User Story Dependencies

- **US1 (P1)**: No dependency on US2 or US3 — independently testable after Phase 2
- **US2 (P2)**: No dependency on US1 completion — Storybook stories testable independently; page wiring (T021–T022) depends on T012 completing first
- **US3 (P3)**: Depends on US1 (T012) and US2 (T021) — layout requires both organisms mounted

### Parallel Opportunities

- T001 ‖ T002 ‖ T003 (separate files, no interdependencies)
- T006 ‖ T007 (separate organism files)
- T008 ‖ T013 (both marked [P] — independent story files for separate organisms)
- T015 ‖ T016 ‖ T017 (independent state branches within StrategyOutputPanel)
- T025 ‖ T026 (separate files, polish phase — lint runs independently of Storybook build)

---

## Parallel Example: User Story 2

```bash
# Launch all independent Output Panel state implementations together:
Task T015: "Implement empty state in StrategyOutputPanel.svelte"
Task T016: "Implement loading state in StrategyOutputPanel.svelte"
Task T017: "Implement error state in StrategyOutputPanel.svelte"
# Then proceed to T018 → T019 → T020 sequentially (build on T015–T017)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001–T005)
2. Complete Phase 2 (T006–T007)
3. Complete Phase 3 (T008–T012)
4. **STOP and VALIDATE**: Load `/strategy-builder`, verify Input Panel independently
5. Merge if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → scaffolding ready
2. Phase 3 (US1) → Input Panel functional → validate independently
3. Phase 4 (US2) → Output Panel functional → validate all four states
4. Phase 5 (US3) → Layout verified → full page complete
5. Phase 6 → CI clean, BDD steps stubbed

### Parallel Team Strategy

With two developers:
1. Both complete Phase 1 + Phase 2 together
2. Developer A: Phase 3 (US1 — StrategyInputPanel)
3. Developer B: Phase 4 US2 T013–T017 (StrategyOutputPanel states in Storybook)
4. Merge when both organisms verified; Developer A + B complete T018–T022 together
5. Phase 5 + Phase 6 together

---

## Notes

- `[P]` tasks = different files, no shared dependencies — safe to run in parallel
- `[BDD]` task (T001) MUST be written and reviewed before ANY implementation task; T027 wires step definitions and MUST produce passing @smoke scenarios before PR (Constitution Rule 6)
- `[STORYBOOK]` tasks (T008, T013) MUST be verified (T009, T014) before logic wiring tasks — see explicit pass criteria in T009/T014 (Constitution Rule 12)
- `[ZOD]` tasks (T002, T003) must precede organism scaffolding (T006, T007); both marked `[P]` — safe to run in parallel with T001
- No Docker changes — this is a frontend-only refactor
- Trade records in Output Panel (T020) use `sampleTrades` from `$lib/shared-mockdata/trades`; `BacktestResultSchema` does not include a trades field; backend integration is out of scope
