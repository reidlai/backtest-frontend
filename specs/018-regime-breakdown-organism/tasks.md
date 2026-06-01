# Tasks: Regime Breakdown Organism

**Input**: Design documents from `specs/018-regime-breakdown-organism/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅

---

## Phase 1: Setup & BDD

**Purpose**: Write the BDD feature file and Storybook story before any implementation. Both are constitutionally required to precede implementation (Rules 6 and 12).

- [x] T001 [BDD] Create BDD feature file `features/regime-breakdown-organism.feature` with @smoke and @integration tags covering: table renders with correct columns, positive/negative return colour coding, empty state "No data available" message, and invalid row exclusion (Constitution Rule 6 — MUST precede implementation)
- [x] T002 [STORYBOOK] Create Storybook story `src/lib/components/organisms/RegimeBreakdownTable.stories.ts` with three variants: Default (mock data), EmptyState (empty array), and InvalidRowFiltered (story-level mock override injecting one invalid row); note — organism has zero props so the InvalidRowFiltered variant uses a module-level mock override, not a prop (Constitution Rule 12 — MUST precede implementation)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the existing Zod schema is adequate and no new dependencies are needed. Verification only — no code changes expected.

- [x] T003 Verify `src/lib/schemas/regime-breakdown.schema.ts` contains all required fields (`regime`, `returnPct`, `maxDrawdown`, `winRate`, `tradeCount`) and that `safeParse` behaviour correctly rejects rows with missing required fields — no changes required

**Checkpoint**: Foundation confirmed — organism implementation can begin.

---

## Phase 3: User Story 1 — View Regime Breakdown Table (Priority: P1) 🎯 MVP

**Goal**: Extract the full inline Regime Breakdown section into a self-contained organism that renders correctly and is dropped into the parent page as a single tag.

**Independent Test**: Navigate to `/performance-result`; confirm the Regime Breakdown section renders identically to before — heading "Regime Breakdown", table with columns "Regime", "Return", "Max DD", "Win Rate", correct row data and colour coding, and "No data available" when array is empty.

### Implementation for User Story 1

- [x] T004 [US1] Create `src/lib/components/organisms/RegimeBreakdownTable.svelte` — the organism renders the full section: outer `<div class="space-y-4">`, `<h2 class="text-xl font-semibold">Regime Breakdown</h2>`, inner card `<div class="overflow-hidden rounded-xl border bg-card shadow-sm">`, and `<Table.Root>` with columns Regime / Return / Max DD / Win Rate; declare `rows` as `$state(sampleRegimeBreakdown.filter((row) => RegimeBreakdownSchema.safeParse(row).success))`; `safeParse` filter is the sole validation gate
- [x] T005 [US1] Add conditional colour classes in `src/lib/components/organisms/RegimeBreakdownTable.svelte`: `returnPct > 0` → `text-green-400`, `returnPct <= 0` → `text-red-400`; `maxDrawdown` → always `text-red-400` (depends on T004)
- [x] T006 [US1] Update `src/routes/performance-result/+page.svelte` — remove the entire outer `<div class="space-y-4">` block (the one containing `<h2>Regime Breakdown</h2>` and the inner card div with `<Table.Root>`) and replace it with a single `<RegimeBreakdownTable />` self-closing tag; add `import RegimeBreakdownTable from '$lib/components/organisms/RegimeBreakdownTable.svelte'`; remove `sampleRegimeBreakdown` from the import in the script block if no other section on the page still uses it (depends on T004)
- [x] T007 [US1] Add empty-state rendering to `src/lib/components/organisms/RegimeBreakdownTable.svelte`: inside `<Table.Body>`, use `{#if rows.length === 0}` to render a single `<Table.Row>` with `<Table.Cell colspan={4} class="text-center text-muted-foreground">No data available</Table.Cell>`, otherwise render the `{#each rows}` block (depends on T004)

**Checkpoint**: User Story 1 complete — full section renders via organism, parent page reduced to `<RegimeBreakdownTable />`, empty state shows "No data available", invalid rows excluded.

---

## Phase 4: User Story 2 — Schema Validation Feedback (Priority: P2)

**Goal**: Confirm invalid rows are silently excluded by the organism's internal `safeParse` filter without crashing the page.

**Independent Test**: Temporarily replace `sampleRegimeBreakdown` in `RegimeBreakdownTable.svelte` with an array containing one malformed entry (e.g., `{ regime: 'Test' }`); confirm it is excluded from the rendered rows with no runtime error, then restore the original import.

### Implementation for User Story 2

- [x] T008 [VERIFY] [US2] Manually verify the `safeParse` filter in `src/lib/components/organisms/RegimeBreakdownTable.svelte` (added in T004) excludes invalid rows without crashing: temporarily inject `{ regime: 'Test' }` into the data array, confirm it is excluded, then restore mock data (depends on T004)

**Checkpoint**: User Story 2 complete — `safeParse` filter confirmed working; invalid rows excluded without crash.

---

## Phase 5: User Story 3 — Local State Isolation (Priority: P3)

**Goal**: The parent page no longer references regime breakdown data; the organism is fully self-contained.

**Independent Test**: Review the script block of `src/routes/performance-result/+page.svelte` — `sampleRegimeBreakdown` must not appear in imports or usage (unless another section still requires it); the `<RegimeBreakdownTable />` tag has no attributes or props.

### Implementation for User Story 3

- [x] T009 [VERIFY] [US3] Confirm in `src/routes/performance-result/+page.svelte` that `sampleRegimeBreakdown` is absent from imports (if unused after T006) and that `<RegimeBreakdownTable />` has no props — organism is fully self-contained (depends on T006)

**Checkpoint**: User Story 3 complete — parent page fully decoupled from regime breakdown data.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final BDD review and Storybook smoke test.

- [x] T010 [P] Review `features/regime-breakdown-organism.feature` and confirm all scenario descriptions match the implemented behaviour (full section rendered, heading included, colour coding, empty state, invalid row exclusion) after T004–T007
- [x] T011 Smoke-test Storybook locally (`pnpm storybook`) and confirm all three variants of `RegimeBreakdownTable.stories.ts` (Default, EmptyState, InvalidRowFiltered) render without error

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
- **US2 (P2)**: Depends on T004 (organism must exist with `safeParse` filter)
- **US3 (P3)**: Depends on T006 (page import must be updated)

### Within Each Phase

- T001 [BDD] MUST precede all implementation tasks (Rule 6)
- T002 [STORYBOOK] MUST precede all implementation tasks (Rule 12)
- T004 MUST precede T005, T006, T007, T008
- T006 MUST precede T009

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T002 and T003 can run in parallel
- T004, T005, T006, T007 can be written in a single implementation pass (all US1, same/adjacent files)
- T008 and T009 can run in parallel (both verification steps, different files)
- T010 and T011 can run in parallel

---

## Implementation Strategy

### MVP (User Story 1 only)

1. Complete Phase 1 (T001, T002)
2. Complete Phase 2 (T003)
3. Complete Phase 3 (T004, T005, T006, T007)
4. **Validate**: Open `/performance-result` — full section renders via organism, heading visible, colour coding correct, empty state works
5. Ship MVP

### Full Delivery (all stories)

1. MVP above
2. Phase 4 — T008 (verify `safeParse` exclusion manually)
3. Phase 5 — T009 (verify import cleanup)
4. Phase 6 — T010 BDD review, T011 Storybook smoke

---

## Notes

- `[P]` tasks touch different files — safe to parallelise
- `[BDD]` and `[STORYBOOK]` tasks are constitutionally mandatory and MUST precede implementation
- The organism renders the **full section** including the `<h2>Regime Breakdown</h2>` heading — the parent page is reduced to `<RegimeBreakdownTable />` with no surrounding wrappers
- Mock data (`sampleRegimeBreakdown`) is intentionally temporary; a future API integration feature will replace the organism's internal data source
- `tradeCount` field is present in the schema and mock data but is NOT rendered in the table — this is intentional and must be preserved
- The `InvalidRowFiltered` Storybook variant uses a story-level module mock override (not a prop) since the organism accepts zero props
