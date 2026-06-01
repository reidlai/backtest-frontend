---
description: 'Task list for Fix Technical Screener Reactive State'
---

# Tasks: Fix Technical Screener Reactive State

**Input**: Design documents from `specs/017-fix-technical-screener-state/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file task appears in Phase 1 and precedes all implementation tasks.

---

## Phase 1: Setup & BDD Feature File

**Purpose**: Add the Cucumber/Gherkin feature file before any implementation begins (Constitution Rule 6).

- [x] T001 [BDD] Create BDD feature file `features/technical-screener-reactive-state.feature` tagged @smoke and @screener covering: (a) page loads without reactive state console errors, (b) pattern selection updates the UI, (c) snapshot round-trip restores selected patterns (Constitution Rule 6 — MUST precede implementation)

---

## Phase 2: Foundational (No blocking prerequisites for this fix)

> This fix has no shared infrastructure prerequisites beyond T001. Phase 2 is intentionally minimal — proceed directly to user story phases.

**Checkpoint**: Feature file exists and describes expected behaviour — implementation can begin.

---

## Phase 3: User Story 1 — Navigate to Technical Screener Without Console Errors (Priority: P1) 🎯 MVP

**Goal**: Apply the single-line `$state()` fix to `selectedPatterns` so Svelte 5 tracks mutations and the `non_reactive_update` console warning is eliminated.

**Independent Test**: Start the dev server, open `/technical-screener` in a browser with DevTools open, verify zero `non_reactive_update` warnings appear. Select and deselect a pattern; confirm the UI updates immediately.

### Implementation for User Story 1

- [x] T002 [US1] Fix reactive state declaration in `src/routes/technical-screener/+page.svelte` line 16: change `let selectedPatterns = new SvelteSet<string>()` to `let selectedPatterns = $state(new SvelteSet<string>())`

**Checkpoint**: User Story 1 is complete and independently testable — no console warnings, UI reflects pattern selection immediately.

---

## Phase 4: User Story 2 — Pattern Selection State Persists Correctly (Priority: P2)

**Goal**: Confirm snapshot capture/restore works correctly now that `selectedPatterns` is reactive; add silent-skip behaviour for unknown pattern IDs on restore.

**Independent Test**: Select one or more patterns on `/technical-screener`, navigate to another page (triggering snapshot capture), then navigate back. Verify the selected patterns are restored. Introduce an unknown pattern ID into the snapshot manually and verify the app restores gracefully without errors.

### Implementation for User Story 2

- [x] T003 [US2] Review snapshot `restore` block in `src/routes/technical-screener/+page.svelte` (lines 24–29): confirm `selectedPatterns.add(p)` iterates only over `result.data.selectedPatterns` (unknown IDs are implicitly skipped if not rendered — document this as a comment if not already clear)

**Checkpoint**: User Story 2 is complete — snapshot round-trips are verified and unknown IDs are handled silently.

---

## Phase 5: Playwright End-to-End Test (SC-004)

**Goal**: Add a regression test that passes in CI, covering SC-004 from the spec: zero reactive-state console errors on page load, and pattern selection updates the UI.

**Independent Test**: Run `pnpm exec playwright test technical-screener-reactive-state` — all scenarios must pass.

### Implementation for Phase 5

- [x] T004 Create Playwright e2e test file `e2e-tests/technical-screener-reactive-state.e2e.ts` implementing the three BDD scenarios from T001: (a) navigate to `/technical-screener` → assert no `non_reactive_update` console message, (b) select a pattern → assert UI reflects the change, (c) snapshot round-trip → assert selected patterns restored

**Checkpoint**: Playwright test passes locally and the BDD scenarios are covered end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T005 [P] Run `pnpm run check` (svelte-check) from repo root and confirm zero type errors related to the `$state()` change in `src/routes/technical-screener/+page.svelte`
- [x] T006 [P] Run `pnpm run lint` from repo root and confirm no lint violations introduced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (BDD)**: No dependencies — start immediately
- **Phase 2**: Trivially complete — no blocking tasks
- **Phase 3 (US1)**: Depends on T001 (BDD file first per Rule 6)
- **Phase 4 (US2)**: Depends on T002 (reactive fix must be in place)
- **Phase 5 (e2e test)**: Depends on T002 (fix must exist to write a passing test against)
- **Phase 6 (Polish)**: Depends on T002, T004

### User Story Dependencies

- **US1 (P1)**: Can start after T001 — no other dependencies
- **US2 (P2)**: Depends on US1 completion (T002)

### Parallel Opportunities

- T004, T005, T006 can all run in parallel after T002 is complete
- T003 can run in parallel with T004 after T002

---

## Parallel Example: Post-fix validation

```bash
# After T002 lands, run in parallel:
Task T003: Review snapshot restore block
Task T004: Write Playwright e2e test
Task T005: Run svelte-check
Task T006: Run lint
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: T001 — BDD feature file
2. Complete Phase 3: T002 — single-line fix
3. **STOP and VALIDATE**: Open DevTools, navigate to `/technical-screener`, confirm zero warnings
4. Ship — this is the entire functional fix

### Full Delivery

1. MVP above (T001, T002)
2. T003 — snapshot restore review
3. T004 — Playwright regression test
4. T005, T006 — lint + type check
5. Open PR to main

---

## Notes

- [P] tasks = different files, no dependencies on each other
- [BDD] task (T001) MUST be committed before T002 per Constitution Rule 6
- T002 is the single source of truth for the fix — one line changed in one file
- The `TechnicalScreenerSchema` (Zod) does NOT need changes — snapshot shape is unchanged
- No Docker, Storybook, or secrets tasks required for this fix
