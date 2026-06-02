# Tasks: Performance Summary & Edit Modal Organisms

**Input**: Design documents from `specs/020-performance-summary-edit-modal-organisms/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file tasks appear in Phase 1 and MUST precede all implementation tasks.

---

## Phase 1: Setup & BDD (Shared Infrastructure)

**Purpose**: BDD feature file (Rule 6 — MUST precede implementation) and Zod schema files (Rule 12 — schema-first workflow).

- [x] T001 [BDD] Create BDD feature file `features/performance-summary-edit-modal-organisms.feature` tagged `@performance-summary-edit-modal @frontend` with @smoke and @integration scenarios for both organisms (Constitution Rule 6 — MUST precede implementation)
- [x] T002 [P] [ZOD] Create `src/lib/schemas/performance-summary.schema.ts` exporting `PerformanceSummarySchema` (wraps `PerfSummaryItemSchema` array with default `[]`) per data-model.md
- [x] T003 [P] [ZOD] Create `src/lib/schemas/edit-metric-modal.schema.ts` exporting `EditMetricModalStateSchema` and `EditMetricValueSchema` per data-model.md
- [x] T004 Update `src/lib/schemas/index.ts` to export `PerformanceSummarySchema`, `EditMetricModalStateSchema`, and `EditMetricValueSchema`

---

## Phase 2: User Story 1 — View Statistics Summary (Priority: P1) 🎯 MVP

**Goal**: Implement the `PerformanceSummary` organism and verify it in Storybook before wiring it into the page (Constitution Rule 12).

**Independent Test**: Mount `PerformanceSummary` in isolation (via Storybook) and confirm all stat rows render; verify empty state renders without crashing.

### Implementation for User Story 1

- [x] T005 [US1] Create `src/lib/components/organisms/PerformanceSummary.svelte` — import `samplePerfSummary`, filter rows via `PerfSummaryItemSchema.safeParse`, use `PerformanceSummarySchema` for local `$state`, render two-column grid with empty state fallback showing "No statistics available"
- [x] T006 [US1] [STORYBOOK] Create `src/lib/components/organisms/PerformanceSummary.stories.ts` with stories: default (all stats rendered), empty state (no valid data) — verify in Storybook before proceeding to T007 (Constitution Rule 12)
- [x] T007 [US1] Remove the Statistics Summary inline block (lines ~134–147) from `src/routes/performance-result/+page.svelte` and replace with `<PerformanceSummary />`

**Checkpoint**: Statistics Summary renders on the performance result page via the new organism; Storybook story verified; parent page no longer contains the inline stats block.

---

## Phase 3: User Story 2 — Edit Metric Value via Modal (Priority: P2)

**Goal**: Implement the `EditMetricModal` organism and verify it in Storybook before wiring it into the page (Constitution Rule 12).

**Independent Test**: View `EditMetricModal` stories in Storybook with open=true — valid input enables Apply; invalid disables + shows error; Cancel fires `onClose`; re-open resets input.

### Implementation for User Story 2

- [x] T008 [US2] Create `src/lib/components/organisms/EditMetricModal.svelte` — accept `open`, `tileId`, `initialValue` props and `onApply`/`onClose` callbacks; manage `editValue` local state via `EditMetricModalStateSchema`; implement `$effect` for `false → true` reset; use `EditMetricValueSchema` for `isValid` derivation; render Dialog with Input, Apply/Cancel buttons
- [x] T009 [US2] [STORYBOOK] Create `src/lib/components/organisms/EditMetricModal.stories.ts` with stories: closed, open with valid input, open with invalid input, open with empty input — verify in Storybook before proceeding to T010 (Constitution Rule 12)
- [x] T010 [US2] Remove the Edit Modal Dialog inline block (lines ~151–171) from `src/routes/performance-result/+page.svelte`, remove `editValue` and `isValid` local declarations, and wire `<EditMetricModal>` with `modalOpen`, `editingTileId`, `initialValue` bindings and `onApply`/`onClose` handlers

**Checkpoint**: Edit Modal works on the performance result page via the new organism; `editValue` and `isValid` are no longer declared in `+page.svelte`.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [x] T011 [P] Verify `src/lib/schemas/index.ts` barrel export is correct and no import errors exist across the codebase (`pnpm check` or `pnpm typecheck`)
- [x] T012 [P] Run BDD scenario smoke pass: confirm `features/performance-summary-edit-modal-organisms.feature` @smoke scenarios pass against the running app
- [x] T013 Verify Storybook stories for both organisms render correctly with `pnpm storybook` (no console errors, all story variants display)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup & BDD)**: No dependencies — start immediately
- **Phase 2 (US1)**: T005 depends on T002/T004; T006 (Storybook) depends on T005; T007 (page wire-up) depends on T006 Storybook approval
- **Phase 3 (US2)**: T008 depends on T003/T004; T009 (Storybook) depends on T008; T010 (page wire-up) depends on T009 Storybook approval
- **Phase 4 (Polish)**: Depends on Phase 2 (US1) and Phase 3 (US2) completion

### User Story Dependencies

- **US1 (P1)**: Depends on `PerformanceSummarySchema` (T002) and barrel export (T004); T006 Storybook must be verified before T007 page wire-up
- **US2 (P2)**: Depends on `EditMetricModalStateSchema`/`EditMetricValueSchema` (T003) and barrel export (T004); T009 Storybook must be verified before T010 page wire-up; independent of US1

### Parallel Opportunities

- T002 and T003 (schema creation) can run in parallel
- T005 (US1 organism) and T008 (US2 organism) can run in parallel once Phase 1 schemas are done
- T006 (US1 Storybook) and T009 (US2 Storybook) can run in parallel
- T011, T012, T013 (Polish) can run in parallel

---

## Parallel Example: Phase 1

```
# Run in parallel:
Task T002: Create performance-summary.schema.ts
Task T003: Create edit-metric-modal.schema.ts

# Then after T002/T003:
Task T004: Update index.ts exports
```

## Parallel Example: Organism Implementation (after Phase 1)

```
# Run in parallel:
Task T005: Create PerformanceSummary.svelte  (US1)
Task T008: Create EditMetricModal.svelte     (US2)

# Then Storybook (in parallel):
Task T006: PerformanceSummary.stories.ts     (after T005)
Task T009: EditMetricModal.stories.ts        (after T008)

# Then page wire-up after each story is verified:
Task T007: Update +page.svelte for US1       (after T006 verified)
Task T010: Update +page.svelte for US2       (after T009 verified)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: BDD + Schemas (T001–T004)
2. Complete Phase 2 US1: organism + Storybook + page wire-up (T005–T007)
3. **STOP and VALIDATE**: Statistics Summary renders via organism, Storybook verified, parent page clean
4. Continue with Phase 3 (US2) if ready

### Incremental Delivery

1. Phase 1 → BDD feature file + schemas ready
2. Phase 2 (US1) → PerformanceSummary organism live (MVP)
3. Phase 3 (US2) → EditMetricModal organism live
4. Phase 4 → Polish and BDD validation

---

## Notes

- [P] = parallelizable (different files, no in-flight dependencies)
- [BDD] tasks (Constitution Rule 6) MUST precede the implementation tasks for the behaviors they describe
- [STORYBOOK] tasks (Constitution Rule 12) MUST precede page integration (T013)
- [ZOD] tasks (Constitution Rule 12) MUST precede organism implementation
- Both organisms follow the `RegimeBreakdownTable` / `PerformanceMetricGrid` pattern confirmed in research.md
- `$effect` with `prevOpen` tracking handles the `false → true` reset (Decision 4 in research.md)
