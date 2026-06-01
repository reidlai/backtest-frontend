# Tasks: Sentiment Events Table Organism

**Input**: Design documents from `specs/013-sentiment-events-organism/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: BDD feature file and schema unit test scaffold — must precede all implementation per Constitution Rules 6 and 12.

- [x] T001 [P] [BDD] Create BDD feature file `features/sentiment-events-organism.feature` tagged `@frontend @smoke` covering all Given/When/Then scenarios from spec.md (Constitution Rule 6 — MUST precede implementation)
- [x] T002 [P] Create schema unit test file `src/lib/schemas/__tests__/sentiment-event.schema.test.ts` with failing tests for: (a) valid event parses successfully, (b) event missing required field (`id`) is rejected, (c) event with invalid `sentiment` enum value is rejected

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Storybook story for the new organism — must be created and verified before component implementation per Constitution Rule 12.

**⚠️ CRITICAL**: T003 must complete before Phase 3 implementation begins.

- [x] T003 [STORYBOOK] Create Storybook story `src/lib/components/organisms/SentimentEventsTable.stories.ts` with two stories: `Default` (full sample events list) and `Empty` (empty array prop) — verify both render correctly in Storybook UI before proceeding (Constitution Rule 12)

**Checkpoint**: Storybook stories verified — organism implementation can now begin.

---

## Phase 3: User Story 1 — View Sentiment Events Table (Priority: P1) 🎯 MVP

**Goal**: Deliver the `SentimentEventsTable` organism that renders all six columns with correct badge and score-bar styling, and update the parent page to use it.

**Independent Test**: Navigate to `/sentiment-events` and confirm the table renders identically to the original inline markup.

### Implementation for User Story 1

- [x] T004 [US1] Create organism component `src/lib/components/organisms/SentimentEventsTable.svelte` — accept `events: unknown[]` prop, import `SentimentEventSchema` from `$lib/schemas`, derive validated list with `$derived`, render Table with all six columns, score bar, sentiment badges, and "No events found" empty-state row
- [x] T005 [US1] Update `src/routes/sentiment-events/+page.svelte` — replace the inline `<div class="overflow-hidden ..."><Table.Root>...</Table.Root></div>` block with `<SentimentEventsTable events={sampleSentimentEvents} />` and remove now-unused Table/Badge imports

**Checkpoint**: US1 fully functional — `/sentiment-events` page renders identically to before.

---

## Phase 4: User Story 2 — Schema-Validated Event Data (Priority: P2)

**Goal**: Ensure the organism filters out invalid events at the prop boundary and logs a warning per rejected item.

**Independent Test**: Pass a mixed array (valid + malformed) as the prop and confirm only valid items render; check console for warnings.

### Implementation for User Story 2

- [x] T006 [US2] Implement `console.warn` logging inside the `$derived` validation loop in `src/lib/components/organisms/SentimentEventsTable.svelte` for each item that fails `SentimentEventSchema.safeParse` (verify T002 unit tests now pass)

**Checkpoint**: US2 complete — schema validation with warning logging verified by unit tests.

---

## Phase 5: User Story 3 — Local SvelteKit State Management (Priority: P3)

**Goal**: Confirm the parent page contains no table markup; all iteration and state management lives inside the organism.

**Independent Test**: Inspect `src/routes/sentiment-events/+page.svelte` — it must contain only the `<SentimentEventsTable>` tag and its import; no `Table.*` or `Badge` imports remain.

### Implementation for User Story 3

- [x] T007 [US3] Verify `src/routes/sentiment-events/+page.svelte` contains no `Table.*`, `Badge`, `cn`, or direct `sampleSentimentEvents` iteration imports/usage; remove any residue left by T005

**Checkpoint**: US3 complete — parent page is fully delegated to organism.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T008 [P] Run `pnpm check` (svelte-check) and fix any TypeScript errors introduced by the new organism; spot-check SC-003 by timing validation of 100 events in browser DevTools console (must complete in < 50 ms)
- [x] T009 [P] Run `pnpm lint` and fix any formatting or lint violations in new/modified files
- [x] T010 Update BDD step definitions in `features/step-definitions/` if new steps in T001's feature file require matching implementations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001, T002 must exist before Storybook review) — BLOCKS Phase 3+
- **Phase 3 (US1)**: Depends on Phase 2 (T003 Storybook verified)
- **Phase 4 (US2)**: Depends on T004 (organism exists); T002 unit tests must be written first (done in Phase 1)
- **Phase 5 (US3)**: Depends on T005 (parent page updated)
- **Phase 6 (Polish)**: Depends on Phases 3–5 complete

### Within Each Phase

- BDD feature file (T001) MUST be written before any implementation task (Constitution Rule 6)
- Storybook story (T003) MUST precede component implementation T004 (Constitution Rule 12)
- T004 (organism creation) precedes T005 (parent page update)
- T006 (warning logging) depends on organism existing (T004)

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T008 and T009 can run in parallel (different concerns)

---

## Parallel Example: Phase 1

```
# Run in parallel:
T001 — Create features/sentiment-events-organism.feature
T002 — Create src/lib/schemas/__tests__/sentiment-event.schema.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001 + T002
2. Complete Phase 2: T003 (Storybook)
3. Complete Phase 3: T004 + T005
4. **STOP and VALIDATE**: `/sentiment-events` renders correctly
5. Run `pnpm check` + `pnpm lint`

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready (BDD + Storybook)
2. Phase 3 (US1) → Visual parity confirmed (MVP)
3. Phase 4 (US2) → Schema validation + unit tests passing
4. Phase 5 (US3) → Parent page cleanup confirmed
5. Phase 6 → CI green

---

## Notes

- `SentimentEventSchema` already exists in `$lib/schemas/sentiment-event.schema.ts` — **do not create a new schema file**
- Use `unknown[]` (not `SentimentEvent[]`) as the prop type so the organism is the sole validation point
- `$derived` (Svelte 5 rune) is the required state mechanism — no `$state` + `$effect` pattern
- Score bar: `Math.abs(score) * 50` % width; direction class `left-1/2` (positive) or `right-1/2` (negative)
- Headline column: `class="w-[400px]"` must be preserved
