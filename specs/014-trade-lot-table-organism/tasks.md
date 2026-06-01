# Tasks: Trade Lot Table Organism

**Input**: Design documents from `specs/014-trade-lot-table-organism/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Schema unit tests included (existing pattern in project). No TDD/BDD step definitions for render behavior (Svelte runtime not available in Cucumber steps — structural file checks only).

**BDD-First (Constitution Rule 6)**: BDD feature file task appears in Phase 1, before any implementation tasks.

---

## Phase 1: Setup & BDD

**Purpose**: Create BDD feature file (Constitution Rule 6 — MUST precede all implementation tasks)

- [x] T001 [BDD] Create BDD feature file `features/trade-lot-table-organism.feature` with @frontend @smoke tag and scenarios for: populated table render, direction color coding, PnL color coding, empty state display, empty state navigation, invalid record exclusion, and parent page delegation (no Table.Root markup, TradeLotTable tag present)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Storybook story (Constitution Rule 12 — MUST precede implementation) and schema unit tests

⚠️ **CRITICAL**: No user story implementation can begin until this phase is complete

- [x] T002 [STORYBOOK] Create Storybook story `src/stories/TradeLotTable.stories.svelte` with three named stories: Default (using sampleTrades from `$lib/shared-mockdata/trades`), Empty (empty array), and WithInvalidRecords (mix of one valid trade and one malformed object)
- [x] T003 [P] Create schema unit tests `src/lib/schemas/__tests__/trade-record.schema.test.ts` covering: valid record passes safeParse, record missing required field fails safeParse, direction value other than 'Long'/'Short' fails safeParse, non-number value for numeric field fails safeParse

**Checkpoint**: Storybook story committed; schema tests written and passing — user story implementation can begin

---

## Phase 3: User Story 1 — View Trade Records Table (Priority: P1) 🎯 MVP

**Goal**: Render a horizontally scrollable 14-column table of validated trade records with direction and PnL color coding

**Independent Test**: Navigate to `/trade-lot` with sample trades loaded — table renders all 14 columns and rows with blue/orange direction styling and green/red PnL styling

- [x] T004 [US1] Create `src/lib/components/organisms/TradeLotTable.svelte` with: `trades: unknown[]` prop, `$derived` `validatedTrades` array using `TradeRecordSchema.safeParse` flatMap (excluding invalid, logging console.warn per exclusion), and populated-state rendering of horizontally scrollable `Table.Root min-w-[1200px]` with 14 columns in order (Trade ID, Symbol, L/S, Entry Date, Entry Price, Exit Date, Exit Price, Qty, Comm., Slip., Net PnL, Return %, Days, Exit Reason) and conditional class logic: direction `text-blue-400`/`text-orange-400`, netPnl `font-semibold text-green-400`/`text-red-400`, returnPct `text-green-400`/`text-red-400`
- [x] T005 [US1] Refactor `src/routes/trade-lot/+page.svelte` to import `TradeLotTable` from `$lib/components/organisms/TradeLotTable.svelte`, replace the inline `div.overflow-hidden.rounded-xl` block (lines 17–77) with `<TradeLotTable {trades} />`, and remove now-unused imports (`* as Table` and `Button` if only used in the removed block)

**Checkpoint**: `/trade-lot` page renders identically to before the refactor; inline Table.Root markup is gone from the route file

---

## Phase 4: User Story 2 — Empty State Navigation (Priority: P2)

**Goal**: When no valid trades exist, show a dashed empty-state card with "No trade records yet." text and a "Go to Backtest Engine" navigation button

**Independent Test**: Render TradeLotTable with `trades={[]}` — empty-state card visible; clicking "Go to Backtest Engine" navigates to `/backtest-engine`

- [x] T006 [US2] Add empty-state branch to `src/lib/components/organisms/TradeLotTable.svelte`: when `validatedTrades.length === 0`, render the `div.m-4.space-y-4.rounded-lg.border-2.border-dashed.bg-muted/20.p-12.text-center` card with `p.font-medium.text-muted-foreground` ("No trade records yet.") and `Button size="sm"` with `onclick={() => goto('/backtest-engine')}` label "Go to Backtest Engine"; import `goto` from `$app/navigation` and `Button` from `$lib/components/ui/button`

**Checkpoint**: Empty story in Storybook shows dashed card; `/trade-lot` with empty trades array shows empty state

---

## Phase 5: User Story 3 — Invalid Data Graceful Exclusion (Priority: P3)

**Goal**: Invalid trade records passed to the organism are silently excluded; valid records still render; a console.warn is emitted per excluded record

**Independent Test**: Pass a mixed array (one valid + one invalid) to TradeLotTable — only valid record appears in table; browser console shows a warning for the excluded record

- [x] T007 [US3] Verify `src/lib/components/organisms/TradeLotTable.svelte` emits `console.warn('[TradeLotTable] Invalid trade excluded:', result.error.issues, e)` for each record that fails safeParse — this should already be present from T004; if not, add the warn call inside the safeParse flatMap branch

**Checkpoint**: WithInvalidRecords Storybook story shows one row (valid record only); console panel shows one warning

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, step definitions, and cleanup

- [x] T008 [P] Create BDD step definitions `features/step-definitions/trade-lot-table-organism.ts` with structural steps: file existence checks for `TradeLotTable.svelte` and `trade-record.schema.ts`, source-text assertion that `+page.svelte` does not contain `Table.Root` markup and does contain `TradeLotTable` component tag
- [x] T009 [P] Run unit tests `npm run test:unit` and confirm `trade-record.schema.test.ts` passes with no failures
- [ ] T010 [MANUAL] Run Storybook `npm run storybook` and visually confirm all three TradeLotTable stories render correctly (Default: full table, Empty: dashed card, WithInvalidRecords: single-row table)
- [x] T011 Run type-check `npm run check` and confirm no TypeScript errors introduced by the new organism or refactored page

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (BDD file should exist before Storybook story references it conceptually) — BLOCKS user stories
- **Phase 3 (US1)**: Depends on Phase 2 complete (Storybook story and schema tests written)
- **Phase 4 (US2)**: Depends on T004 from Phase 3 (organism file must exist to add empty state branch)
- **Phase 5 (US3)**: Depends on T004 from Phase 3 (warn call lives in the same organism file)
- **Phase 6 (Polish)**: Depends on Phases 3–5 complete

### User Story Dependencies

- **US1 (P1)**: Blocks US2 and US3 — organism file created here
- **US2 (P2)**: Depends on T004 (organism exists); can overlap with US3 since they touch different branches of the same `{#if}`
- **US3 (P3)**: Logically included in T004; T007 is a verification/completion task

### Within Each Phase

- BDD feature file ([BDD] T001) MUST be committed before any implementation task
- [STORYBOOK] T002 MUST be committed before T004 (Constitution Rule 12)
- T003 schema tests [P] can run in parallel with T002
- T005 (parent page refactor) depends on T004 (organism must exist first)
- T006 depends on T004 (adds branch to existing organism file)

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- T008 and T009 and T010 can run in parallel (independent verification)

---

## Parallel Example: Phase 2

```bash
# Run in parallel:
Task T002: "Create Storybook story src/stories/TradeLotTable.stories.svelte"
Task T003: "Create schema unit tests src/lib/schemas/__tests__/trade-record.schema.test.ts"
```

## Parallel Example: Phase 6

```bash
# Run in parallel:
Task T008: "Create BDD step definitions features/step-definitions/trade-lot-table-organism.ts"
Task T009: "Run unit tests npm run test:unit"
Task T010: "Verify Storybook stories visually"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: BDD feature file
2. Complete Phase 2: Storybook story + schema tests
3. Complete Phase 3 (T004 + T005): Organism + parent page refactor
4. **STOP and VALIDATE**: `/trade-lot` page renders correctly, no regressions
5. Proceed to US2/US3 for empty state and validation behavior

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1) → Core table renders, parent page refactored (MVP ✅)
3. Phase 4 (US2) → Empty state works
4. Phase 5 (US3) → Invalid data handled gracefully
5. Phase 6 → All verification passes, PR ready

---

## Notes

- [P] tasks = different files, no inter-task dependencies
- [BDD] tasks (T001) MUST precede all implementation — Constitution Rule 6
- [STORYBOOK] task (T002) MUST precede implementation tasks — Constitution Rule 12
- T007 is likely a no-op if T004 was implemented correctly; it exists to ensure the warn behavior is explicitly verified
- The organism file `TradeLotTable.svelte` is touched in T004, T006, and T007 — sequence these strictly
- After T005, confirm `+page.svelte` has no `Table.Root`, no `Table.Header`, and no `Table.Body` remaining
