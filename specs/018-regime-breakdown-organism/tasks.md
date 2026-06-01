# Tasks: Regime Breakdown Organism

**Input**: Design documents from `specs/018-regime-breakdown-organism/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅

---

## Phase 1: Setup & BDD

**Purpose**: Write the BDD feature file and Storybook story before any implementation. Both are constitutionally required to precede implementation (Rules 6 and 12).

- [ ] T001 [BDD] Create BDD feature file `features/regime-breakdown-organism.feature` with @smoke tag covering: table renders with correct columns, positive/negative return colour coding, empty state "No data available" message, and invalid row exclusion (Constitution Rule 6 — MUST precede implementation)
- [ ] T002 [STORYBOOK] Create Storybook story `src/lib/components/organisms/RegimeBreakdownTable.stories.ts` with three variants: Default (mock data), EmptyState (empty array), and InvalidRowFiltered (one invalid row injected) (Constitution Rule 12 — MUST precede implementation)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the existing Zod schema is adequate and no new dependencies are needed. This phase is a verification step — no code changes expected.

- [ ] T003 Verify `src/lib/schemas/regime-breakdown.schema.ts` contains all required fields (`regime`, `returnPct`, `maxDrawdown`, `winRate`, `tradeCount`) and that `safeParse` behaviour is as expected — no changes required

**Checkpoint**: Foundation confirmed — organism implementation can begin.

---

## Phase 3: User Story 1 — View Regime Breakdown Table (Priority: P1) 🎯 MVP

**Goal**: Extract the inline Regime Breakdown markup into a self-contained organism that renders the table with correct columns and colour-coded values.

**Independent Test**: Navigate to `/performance-result`; confirm Regime Breakdown table renders with columns "Regime", "Return", "Max DD", "Win Rate" and correct row data from mock.

### Implementation for User Story 1

- [ ] T004 [US1] Create `src/lib/components/organisms/RegimeBreakdownTable.svelte` — declare `rows` as `$state(sampleRegimeBreakdown.filter((row) => RegimeBreakdownSchema.safeParse(row).success))`, render shadcn-svelte `<Table.Root>` with columns Regime / Return / Max DD / Win Rate; `safeParse` filter is the sole validation gate (no separate step needed)
- [ ] T005 [US1] Add conditional colour classes in `RegimeBreakdownTable.svelte`: `returnPct > 0` → `text-green-400`, `returnPct <= 0` → `text-red-400`; `maxDrawdown` → always `text-red-400`
- [ ] T006 [US1] Update `src/routes/performance-result/+page.svelte` — replace the inline Regime Breakdown `<div>` containing the `<h2>Regime Breakdown</h2>` heading and `<Table.Root>` block with `<RegimeBreakdownTable />` and add the import; remove `sampleRegimeBreakdown` import if no longer used by other sections; confirm no prop is passed to the organism
- [ ] T007 [US1] Add empty-state rendering to `src/lib/components/organisms/RegimeBreakdownTable.svelte`: when `rows.length === 0`, render a single `<Table.Row>` with `<Table.Cell colspan={4}>` containing "No data available" (centred, muted text) (depends on T004)

**Checkpoint**: User Story 1 complete — table renders identically to before the refactor, colour coding is correct, empty state shows "No data available", and invalid rows are excluded.

---

## Phase 4: User Story 2 — Schema Validation Feedback (Priority: P2)

**Goal**: Invalid rows are silently excluded by the organism's internal Zod validation; the page does not crash.

**Independent Test**: Temporarily replace the mock data initialiser in `RegimeBreakdownTable.svelte` with an array containing one malformed entry (e.g., `{ regime: 'Test' }`) and confirm it is excluded from the rendered rows with no runtime error.

### Implementation for User Story 2

- [ ] T008 [VERIFY] [US2] Manually verify the `safeParse` filter in `RegimeBreakdownTable.svelte` (added in T004) excludes invalid rows without crashing: temporarily inject `{ regime: 'Test' }` into the data array, confirm it is excluded, then restore mock data (depends on T004)

**Checkpoint**: User Story 2 complete — `safeParse` filter confirmed working; invalid rows excluded without crash.

---

## Phase 5: User Story 3 — Local State Isolation (Priority: P3)

**Goal**: The parent page no longer owns or imports regime breakdown data; the organism is self-contained and reusable.

**Independent Test**: Review `src/routes/performance-result/+page.svelte` script block — `sampleRegimeBreakdown` must not appear (unless another section still uses it); the organism renders without any data prop from the parent.

### Implementation for User Story 3

- [ ] T009 [VERIFY] [US3] Confirm in `src/routes/performance-result/+page.svelte` that `sampleRegimeBreakdown` is absent from imports (if unused after T006) and that `<RegimeBreakdownTable />` has no props — organism is self-contained (depends on T006)

**Checkpoint**: User Story 3 complete — parent page fully decoupled from regime breakdown data.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final BDD review and Storybook smoke test.

- [ ] T010 [P] Review `features/regime-breakdown-organism.feature` and confirm scenario wording aligns with implemented behaviour after T004–T007
- [ ] T011 Smoke-test the Storybook stories locally (`pnpm storybook`) and confirm all three variants (Default, EmptyState, InvalidRowFiltered) render without error

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup & BDD)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: No dependencies — can run in parallel with Phase 1
- **Phase 3 (US1)**: Depends on Phase 1 (T001, T002) and Phase 2 (T003)
- **Phase 4 (US2)**: Depends on T004 (organism created in Phase 3)
- **Phase 5 (US3)**: Depends on T006 (page updated in Phase 3)
- **Phase 6 (Polish)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies — starts after foundation
- **US2 (P2)**: Depends on T004 (organism must exist with safeParse filter)
- **US3 (P3)**: Depends on T006 (page update must be complete)

### Within Each Phase

- [BDD] task T001 MUST precede all implementation tasks (Rule 6)
- [STORYBOOK] task T002 MUST precede all implementation tasks (Rule 12)
- T004 (organism creation with safeParse) MUST precede T005, T007, T008
- T006 (page update) MUST precede T009

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T002 and T003 can run in parallel
- T004, T005, T006, T007 can be batched in a single implementation pass (all US1)
- T008 and T009 can run in parallel (both are verification steps, different focus)
- T010 and T011 can run in parallel

---

## Implementation Strategy

### MVP (User Story 1 only)

1. Complete Phase 1 (T001, T002)
2. Complete Phase 2 (T003)
3. Complete Phase 3 (T004, T005, T006, T007)
4. **Validate**: Open `/performance-result` — table renders identically, empty state works, invalid rows excluded
5. Ship MVP

### Full Delivery (all stories)

1. MVP above
2. Phase 4 — T008 (verify safeParse exclusion manually)
3. Phase 5 — T009 (verify import cleanup)
4. Phase 6 — T010 BDD review, T011 Storybook smoke

---

## Notes

- `[P]` tasks touch different files — safe to parallelise
- `[BDD]` and `[STORYBOOK]` tasks are constitutionally mandatory and must precede implementation
- No new dependencies required — Zod, shadcn-svelte Table, and Svelte 5 `$state` are all already present
- Mock data (`sampleRegimeBreakdown`) is intentionally temporary; a future API integration feature will replace the organism's data source
- `tradeCount` field is present in the schema and mock data but is NOT rendered in the table — this is intentional and must be preserved
