# Tasks: Fix Browser Extension Message Channel Error

**Input**: Design documents from `specs/019-fix-browser-extension-error/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: No separate test tasks requested. BDD feature file is the primary acceptance gate (Constitution Rule 6 — mandatory).

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file tasks appear in Phase 1 and MUST precede any implementation tasks.

---

## Phase 1: Setup & BDD Feature File

**Purpose**: Add the BDD acceptance gate that covers home page load console cleanliness. This is the primary deliverable for US1 and US2.

- [x] T001 [BDD] Create BDD feature file `features/fix-browser-extension-error.feature` tagged `@smoke @fix` with scenarios for US1 (clean load using step `the browser console shows no errors for route "/"`), US2 (10-reload stability using step `the user reloads "/" 10 consecutive times`), and US3 (API swap compatibility tagged `@future`) — must precede all implementation tasks (Constitution Rule 6)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Step definitions that US1 and US2 scenarios depend on. US3 step definition can be stubbed.

**⚠️ CRITICAL**: BDD scenarios must have runnable step definitions before Phase 3 implementation begins.

- [x] T002 Create `features/step-definitions/fix-browser-extension-error.ts` — new file with necessary imports from `@cucumber/cucumber` and Playwright; import shared world/context from the existing step-definitions pattern used in `features/step-definitions/fix-ui-runtime-errors.ts`
- [x] T003 [P] Add step definition `the browser console shows no errors for route {string}` in `features/step-definitions/fix-browser-extension-error.ts` using Playwright's `page.on('console', ...)` filtered to `localhost:*` origin only — this is the home-page-specific variant of the shared step; do NOT duplicate the existing `the browser console shows no uncaught errors` step from `fix-ui-runtime-errors.ts`
- [x] T004 [P] Add step definition `the user reloads {string} {int} consecutive times` in `features/step-definitions/fix-browser-extension-error.ts` using Playwright's `page.reload()` in a loop; capture console errors filtered to `localhost:*` origin after each reload
- [x] T005 [P] Add stub step definition for `the app is running with at least one component using a real async data source` in `features/step-definitions/fix-browser-extension-error.ts` — use `return 'pending'` (Cucumber.js pending convention) to mark as skipped until API integration begins

**Checkpoint**: BDD scenarios T001–T003 are wired and the clean-load scenarios (US1/US2) pass green in CI.

---

## Phase 3: User Story 1 — Clean Dev Server Load (Priority: P1) 🎯 MVP

**Goal**: Verify the home page loads without message channel errors and provide confirmed root-cause documentation in the spec.

**Independent Test**: Open browser console, navigate to `/`, verify no uncaught errors. Run `pnpm test:e2e` and confirm `fix-browser-extension-error.feature` US1 scenario passes.

### Implementation for User Story 1

- [x] T006 [US1] Verify `features/fix-browser-extension-error.feature` was created (T001) using the `the browser console shows no errors for route "/"` step — if T001 used the generic step instead, update the US1 scenario step here
- [x] T007 [US1] Verify FR-007 `[RESOLVED]` wording in `specs/019-fix-browser-extension-error/spec.md` is accurate, and update the spec's **Status** front-matter field from `Draft` to `Ready-for-Implementation`
- [x] T008 [P] [US1] Verify `features/fix-browser-extension-error.feature` US1 scenario passes by running `pnpm test:e2e -- --grep "Home page loads without message channel errors"`

**Checkpoint**: US1 scenario green; spec reflects confirmed root cause.

---

## Phase 4: User Story 2 — Stable Reload Behavior (Priority: P2)

**Goal**: Confirm the error does not accumulate across repeated reloads (10x) in a clean browser session.

**Independent Test**: Run `pnpm test:e2e -- --grep "Home page console stays clean across multiple reloads"` and verify it passes.

### Implementation for User Story 2

- [x] T009 [US2] Verify `the user reloads {string} {int} consecutive times` step (T004) correctly captures only `localhost:*` console errors across all reload iterations — review implementation against A2 guidance before running the scenario
- [x] T010 [US2] Verify `features/fix-browser-extension-error.feature` US2 scenario passes by running `pnpm test:e2e -- --grep "Home page console stays clean across multiple reloads"`

**Checkpoint**: US1 and US2 scenarios both green.

---

## Phase 5: User Story 3 — Future API Migration Compatibility (Priority: P3)

**Goal**: Extend `async-channel.stub.ts` with documented patterns for fetch-on-mount cancellation and event-driven listener cleanup, so future implementers have a complete reference. US3 BDD scenario is scaffolded but tagged `@future`.

**Independent Test**: Code review of `async-channel.stub.ts` confirms both `AbortController` (fetch-on-mount) and listener-deregistration (event-driven) patterns are documented. The `@future`-tagged BDD scenario is present but skipped in current CI.

### Implementation for User Story 3

- [x] T011 [US3] Extend `src/lib/services/async-channel.stub.ts` with documented `AbortController` fetch-on-mount cancellation pattern as a JSDoc comment example — do NOT add runtime code; documentation only
- [x] T012 [P] [US3] Add event-driven listener deregistration pattern example as a JSDoc comment in `src/lib/services/async-channel.stub.ts`
- [x] T013 [US3] Verify `features/step-definitions/fix-browser-extension-error.ts` stub step for `the app is running with at least one component using a real async data source` uses `return 'pending'` (Cucumber.js convention) and the `@future`-tagged BDD scenario is skipped in CI automatically

**Checkpoint**: Stub file is a complete reference for all async patterns; US3 scenario scaffolded.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T014 [P] Update `specs/019-fix-browser-extension-error/checklists/requirements.md` — mark all items as passing after implementation
- [x] T015 Run `pnpm lint` and `pnpm check` to confirm no TypeScript or formatting violations introduced
- [x] T016 [P] Confirm CI gates pass locally: `pnpm test:unit` (no new unit tests; existing suite must remain green) and `pnpm test:e2e` (new BDD scenarios green)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (BDD file)**: No dependencies — start immediately
- **Phase 2 (Step definitions)**: Depends on Phase 1 (T001 must exist before T002–T005)
- **Phase 3 (US1)**: Depends on Phase 2; T006 updates the feature file to use the new step from T003
- **Phase 4 (US2)**: Depends on T004 being implemented; can run in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 2; can run in parallel with Phases 3 and 4
- **Phase 6 (Polish)**: Depends on all desired story phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — T006 requires T003 complete
- **US2 (P2)**: Can start after T004 is implemented — no dependency on US1 or US3
- **US3 (P3)**: Can start after Phase 2 — no dependency on US1 or US2

### Within Each Story

- BDD feature file (T001) MUST exist before step definitions (T002–T005)
- T002 (file creation) MUST complete before T003, T004, T005 can be written
- Step definitions T003–T005 MUST be wired before verification tasks (T008, T010, T013)

### Parallel Opportunities

- T003, T004, T005 can run in parallel with each other after T002 completes (T002 creates the file; T003–T005 each add an independent function to it)
- T008 and T010 can run in parallel once their respective step definitions (T003 and T004) are complete
- T011 and T012 can run in parallel (both add independent JSDoc sections to `async-channel.stub.ts`)
- T014 and T016 can run in parallel in the polish phase

---

## Parallel Example: Phase 2

```
# After T002 creates the file, wire all three step definitions simultaneously:
Task T003: new localhost-filtered console step for "/"
Task T004: reload-N-times step with localhost filter
Task T005: pending stub for API swap scenario
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Create BDD feature file (T001)
2. Complete Phase 2: Create step file + wire step definitions (T002, T003, T004, T005)
3. Complete Phase 3: Update feature file + finalize spec + verify US1 scenario green (T006, T007, T008)
4. **STOP and VALIDATE**: `pnpm test:e2e` passes for home page load scenario
5. This alone satisfies the primary acceptance criterion (SC-001)

### Incremental Delivery

1. Phase 1 + 2 → BDD scaffolding ready
2. Phase 3 → US1 green (clean load confirmed)
3. Phase 4 → US2 green (stable reloads confirmed)
4. Phase 5 → US3 scaffolded (forward-compat docs in place)
5. Phase 6 → CI green, checklist updated

---

## Notes

- [P] tasks operate on different files or independent sections — safe to parallelize
- [BDD] tasks (T001) MUST precede implementation per Constitution Rule 6
- The `@future` tag on the US3 BDD scenario causes it to be skipped in current CI; it activates automatically when API integration adds a real implementation of that step
- Step definitions in `features/step-definitions/fix-ui-runtime-errors.ts` (`the app is running`, `the user navigates to {string}`, `the browser console shows no uncaught errors`) MUST be reused, not duplicated — import or reference them from the new step file
- No suppression of real errors is permitted — the fix is documentation + test coverage, not error masking
