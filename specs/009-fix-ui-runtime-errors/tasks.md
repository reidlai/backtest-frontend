# Tasks: Fix UI Runtime Errors on Technical Screener and Performance Result Pages

**Input**: Design documents from `specs/009-fix-ui-runtime-errors/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: Unit test update included (existing test suite requires updating for `AppStateSchema` change).

**BDD-First** (Constitution Rule 6): BDD feature file tasks appear in Phase 1 and MUST precede all implementation tasks.

**Step definitions note**: Step definition tasks (T005, T007) intentionally appear in Phase 3/4 (story-specific) after the feature file is written in Phase 1. Step definitions implement the BDD contract story-by-story and cannot be written before the feature file exists.

---

## Phase 1: Setup & BDD Feature File

**Purpose**: Write the BDD acceptance test that gates both user stories. Per Constitution Rule 6, this MUST precede any implementation.

- [x] T001 [BDD] Create BDD feature file `features/fix-ui-runtime-errors.feature` with three scenarios tagged `@smoke @fix` — use these exact Given/When/Then steps: **Scenario 1**: `Given the app is running / When the user navigates to "/technical-screener" 5 consecutive times / Then the browser console shows no uncaught errors` — **Scenario 2**: `Given no backtest has been run / When the user navigates to "/performance-result" / Then the page renders metric tiles with default values of 0 and no TypeError appears in the browser console` — **Scenario 3**: `Given simulatedMetrics is populated with totalReturn 42.8, maxDrawdown -18.2, winRate 58.3 / When the user navigates to "/performance-result" / Then the metric tiles display the corresponding values`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The Zod schema change (`AppStateSchema`) is shared by both user stories. It MUST be complete before either story's implementation begins.

**⚠️ CRITICAL**: Both US1 and US2 depend on this phase.

- [x] T002 [ZOD] Add `SimulatedMetricsSchema` and extend `AppStateSchema` in `src/lib/schemas/app-state.schema.ts` — add `simulatedMetrics: SimulatedMetricsSchema.default({})` where `SimulatedMetricsSchema = z.object({ totalReturn: z.number().default(0), maxDrawdown: z.number().default(0), winRate: z.number().default(0) })`; also add a rejection test companion at T003
- [x] T003 Update unit test in `src/lib/schemas/__tests__/state-schemas.schema.test.ts` — (a) update the existing `AppStateSchema parse({})` test to expect `simulatedMetrics: { totalReturn: 0, maxDrawdown: 0, winRate: 0 }` in the result; (b) add a new test asserting `SimulatedMetricsSchema.safeParse({ totalReturn: 'bad' }).success === false` to match the rejection-test pattern used elsewhere in the file (depends on T002)

**Checkpoint**: Schema updated and unit tests pass — run `pnpm test:unit` to verify before continuing.

---

## Phase 3: User Story 1 — Navigate to Technical Screener Without Errors (Priority: P1) 🎯 MVP

**Goal**: Technical Screener navigation produces zero uncaught errors in the browser console.

**Independent Test**: Run `pnpm dev`, navigate to Technical Screener 5 consecutive times, observe zero uncaught errors in DevTools console (matches SC-001).

### Implementation for User Story 1

- [x] T004 [US1] Create `src/lib/services/async-channel.stub.ts` — export a documented no-op stub function `asyncChannelRequest` with a JSDoc comment explaining: "Placeholder for future async API integration. When the app integrates with a Chrome extension or service worker, this module will implement `chrome.runtime.sendMessage` with proper `sendResponse` handling to prevent 'message channel closed' errors. See specs/009-fix-ui-runtime-errors/plan.md Bug 2 for context." Export type `AsyncChannelRequest = () => Promise<void>` and a stub implementation that returns `Promise.resolve()`.
- [x] T005 [US1] Add step definitions for Technical Screener scenario in `features/step-definitions/fix-ui-runtime-errors.ts` — implement: `Given("the app is running", ...)` using Playwright `page` fixture; `When("the user navigates to {string} {int} consecutive times", ...)` navigating the given path N times; `Then("the browser console shows no uncaught errors", ...)` using a `page.on('console', ...)` listener that collects `console.error` messages and asserts the array is empty (depends on T001)

**Checkpoint**: User Story 1 independently testable. BDD scenario for Technical Screener passes. Async channel stub provides the future integration hook required by FR-005.

---

## Phase 4: User Story 2 — Navigate to Performance Result Without Errors (Priority: P1)

**Goal**: Performance Result page loads with default metric tile values and zero TypeErrors in the console when no backtest has been run.

**Independent Test**: Run `pnpm dev`, navigate to Performance Result — page renders metric tiles showing `0` values with no TypeError in DevTools console, renders within 2 seconds (SC-002, SC-003).

### Implementation for User Story 2

- [x] T006 [US2] Add `simulatedMetrics` reactive property to `AppState` class in `src/lib/state/app.svelte.ts` — add `simulatedMetrics = $state(_defaults.simulatedMetrics)` immediately after the `backtestPrefillSymbol` property, following the existing initialization pattern (depends on T002)
- [x] T007 [US2] Add step definitions for Performance Result scenarios in `features/step-definitions/fix-ui-runtime-errors.ts` — implement: `Given("no backtest has been run", ...)` as a no-op (default state); `When("the user navigates to {string}", ...)` reusing the navigation step from T005; `Then("the page renders metric tiles with default values of 0 and no TypeError appears in the browser console", ...)` using `page.waitForSelector('[data-testid="metric-tile"]', { timeout: 2000 })` and asserting no console errors; `Given("simulatedMetrics is populated with totalReturn {float}, maxDrawdown {float}, winRate {float}", ...)` injecting state via `page.evaluate`; `Then("the metric tiles display the corresponding values", ...)` asserting tile text content (depends on T005)

**Checkpoint**: User Story 2 independently testable. Navigate to Performance Result — page renders with `0` defaults, no TypeError, within 2 seconds. Run `pnpm test:unit` to confirm schema tests pass.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verification pass, constraint audit, and CI readiness.

- [x] T008 [P] Run full unit test suite `pnpm test:unit` and confirm all tests pass including the updated `AppStateSchema` test and new `SimulatedMetricsSchema` rejection test (T003)
- [x] T009 [P] Run `pnpm dev` and manually verify both pages: navigate to Technical Screener 5 consecutive times (SC-001) and Performance Result 5 consecutive times (SC-002) — confirm zero uncaught errors each time and Performance Result renders within 2 seconds (SC-003)
- [x] T010 [P] Audit `src/routes/performance-result/+page.svelte` `$effect` block — confirm it contains no optional chaining (`?.`), nullish coalescing (`??`), or explicit null/undefined checks for `simulatedMetrics` or its sub-properties (FR-004 constraint: null-guards are forbidden; defaults are provided by AppState)
- [x] T011 Update `specs/009-fix-ui-runtime-errors/checklists/requirements.md` to mark all items complete and record SC-001/SC-002/SC-003 verification results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (BDD)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (BDD file written before implementation) — BLOCKS both user stories
- **Phase 3 (US1)**: Depends on Phase 2 completion — step definitions depend on BDD file (T001)
- **Phase 4 (US2)**: Depends on Phase 2 completion — `AppState` change requires schema updated first (T002)
- **Phase 5 (Polish)**: Depends on Phase 3 and Phase 4 completion

### User Story Dependencies

- **User Story 1 (P1)**: T001 → T002 → T004 → T005
- **User Story 2 (P1)**: T001 → T002 → T003 → T006 → T007

### Within Each Phase

- T002 → T003 (schema must exist before test can be updated)
- T001 → T005 (BDD file before step definitions)
- T005 → T007 (US2 steps reuse US1 navigation step)
- T002 → T006 (`AppState` reads from `_defaults` which requires schema update)

### Parallel Opportunities

- T001 (BDD) and T002 (ZOD schema) can be worked in parallel (different files)
- T004 (stub service) and T006 (AppState property) can run in parallel after T002 (different files)
- T008, T009, T010 (polish checks) can all run in parallel

---

## Parallel Example: Phase 1 + Phase 2

```bash
# These two can be worked simultaneously:
Task T001: Create features/fix-ui-runtime-errors.feature
Task T002: Add SimulatedMetricsSchema to src/lib/schemas/app-state.schema.ts
```

---

## Implementation Strategy

### MVP (Both Stories — both P1 bug fixes)

1. Complete Phase 1: Write BDD feature file with full step language (T001)
2. Complete Phase 2: Update Zod schema (T002) + unit tests (T003)
3. Complete Phase 4: Add `simulatedMetrics` to `AppState` (T006) — primary fix
4. **VALIDATE**: Run `pnpm dev`, navigate to Performance Result — TypeError gone ✅
5. Complete Phase 3: Async channel stub (T004) + step definitions (T005)
6. Complete Phase 5: Polish, audit, and verification pass

### Minimal Change Summary

| File | Change |
|---|---|
| `src/lib/schemas/app-state.schema.ts` | Add `SimulatedMetricsSchema`; extend `AppStateSchema` |
| `src/lib/state/app.svelte.ts` | Add `simulatedMetrics = $state(_defaults.simulatedMetrics)` |
| `src/lib/schemas/__tests__/state-schemas.schema.test.ts` | Update parse test + add rejection test |
| `src/lib/services/async-channel.stub.ts` | New no-op stub with integration guidance comment |
| `features/fix-ui-runtime-errors.feature` | New BDD feature file (3 scenarios, full step language) |
| `features/step-definitions/fix-ui-runtime-errors.ts` | New step definitions (Playwright-based) |

**No changes needed** to `performance-result/+page.svelte` — the `$effect` already reads `appState.simulatedMetrics` correctly; the bug was the missing property on `appState`.

---

## Notes

- `[P]` tasks = different files, no shared dependencies — safe to work concurrently
- `[BDD]` task (T001) must be written first per Constitution Rule 6 — non-negotiable
- `[ZOD]` task (T002) is the foundational fix — everything else flows from this
- The Technical Screener error (US1) has no application code fix; T004 async stub + T005 BDD step serve as forward-compatibility scaffold and regression gate respectively
- T010 is a read-only audit — if optional chaining is found, the `$effect` must be corrected before merge
- Run `pnpm test:unit` after T003 to confirm no regressions before continuing
