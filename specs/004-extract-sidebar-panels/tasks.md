# Tasks: Extract AI Review Sidebar Panels into Separate Organisms

**Input**: Design documents from `/specs/004-extract-sidebar-panels/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: No automated unit/integration tests per spec (pure structural refactor); Storybook visual verification per Constitution Rule 12; manual browser comparison per SC-002.

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file MUST appear in Phase 1 and MUST precede any implementation tasks.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- **[BDD]**: Gherkin feature file — MUST precede implementation (Rule 6)
- **[STORYBOOK]**: Storybook story — MUST precede sidebar integration (Rule 12)

---

## Phase 1: Setup

**Purpose**: BDD feature file documenting preserved sidebar behaviors — MUST complete before any organism implementation.

- [x] T001 [BDD] Create `features/ai-review-sidebar-panels.feature` with Gherkin scenarios for all 4 panel behaviors (tagged `@smoke @ui`): AI Review panel renders grade/confidence/flags; Resource Cost panel renders progress bars and stats; AI Chat panel shows placeholder, sends messages; Quick Actions panel renders 4 buttons — mirrors Given/When/Then scenarios from spec.md

---

## Phase 2: Foundational

**Purpose**: Baseline measurement required for SC-004 verification at project end.

- [x] T002 Record pre-refactor baseline — note that `src/lib/components/organisms/AIReviewSidebar.svelte` currently has **229 lines**; post-refactor target is ≤69 lines (≥70% reduction per SC-004)

**Checkpoint**: BDD feature file written and baseline recorded — organism implementation can now begin (Phases 3–6 can run in parallel)

---

## Phase 3: User Story 1 — View AI Review Panel as Standalone Component (Priority: P1) 🎯 MVP

**Goal**: Extract the AI Review panel (grade, confidence badge, risk flags list) into a self-contained organism that imports `sampleAIReview` directly.

**Independent Test**: Open Storybook → Organisms/AIReviewPanel → confirm grade, confidence badge, and all three risk flags render without the AIReviewSidebar wrapper.

### Implementation for User Story 1

- [x] T003 [STORYBOOK] [US1] Create `src/stories/AIReviewPanel.stories.svelte` — `defineMeta` with `title: 'Organisms/AIReviewPanel'`, `tags: ['autodocs']`, dark background; single no-arg `<Story name="Default" />` (component imports sample data internally)
- [x] T004 [US1] Create `src/lib/components/organisms/AIReviewPanel.svelte` — extract AI Review panel `<div>` block from AIReviewSidebar; import `sampleAIReview` from `$lib/data/strategy`, `Badge` from `$lib/components/ui/badge`, `RiskFlagItem` from `$lib/components/molecules/RiskFlagItem.svelte`; no props; no `<script>` context or state needed
- [ ] T005 [US1] Verify AIReviewPanel in Storybook — confirm grade circle, confidence badge, and all risk flag items render correctly; confirm component is independently renderable without AIReviewSidebar

**Checkpoint**: AIReviewPanel.svelte complete and passing Storybook verification — US1 independently testable

---

## Phase 4: User Story 2 — View Resource & Cost Panel as Standalone Component (Priority: P2)

**Goal**: Extract the Resource & Cost panel (token/backtest progress bars, runtime, plan impact) into a self-contained organism that imports `sampleResourceUsage` directly.

**Independent Test**: Open Storybook → Organisms/ResourceCostPanel → confirm both progress bars, estimated runtime, and plan impact stat grid render without the AIReviewSidebar wrapper.

### Implementation for User Story 2

- [x] T006 [P] [STORYBOOK] [US2] Create `src/stories/ResourceCostPanel.stories.svelte` — `defineMeta` with `title: 'Organisms/ResourceCostPanel'`, dark background; single no-arg `<Story name="Default" />`
- [x] T007 [P] [US2] Create `src/lib/components/organisms/ResourceCostPanel.svelte` — extract Resource & Cost panel `<div>` block from AIReviewSidebar; import `sampleResourceUsage` from `$lib/data/strategy`, `Progress` from `$lib/components/ui/progress`; no props; stateless
- [ ] T008 [US2] Verify ResourceCostPanel in Storybook — confirm Tokens Used progress bar (4250/10000), Backtests progress bar (3/10), Est. Runtime (~42s), and Plan Impact (medium) render correctly

**Checkpoint**: ResourceCostPanel.svelte complete and passing Storybook verification — US2 independently testable

---

## Phase 5: User Story 3 — Interact with AI Chat Panel as Standalone Component (Priority: P3)

**Goal**: Extract the AI Chat panel (message list, textarea, send button) into an organism that owns its own `$state` for `messages` and `chatInput`, and migrates `.scrollbar-hide` CSS from AIReviewSidebar.

**Independent Test**: Open Storybook → Organisms/AIChatPanel → confirm placeholder text on empty state; type a message, click Send, confirm user bubble and assistant reply appear in message list.

### Implementation for User Story 3

- [x] T009 [P] [STORYBOOK] [US3] Create `src/stories/AIChatPanel.stories.svelte` — `defineMeta` with `title: 'Organisms/AIChatPanel'`, dark background; single no-arg `<Story name="Default" />`
- [x] T010 [P] [US3] Create `src/lib/components/organisms/AIChatPanel.svelte` — extract AI Chat panel markup and logic from AIReviewSidebar; declare `messages = $state<ChatMessage[]>([])` and `chatInput = $state('')` locally; implement `handleSendMessage`; import `Button`, `Textarea` from `$lib/components/ui/`, `ChatMessage` type; **include `<style>` block with `.scrollbar-hide` CSS rules** (migrated from AIReviewSidebar per FR-008)
- [ ] T011 [US3] Verify AIChatPanel in Storybook — confirm placeholder text renders on empty state; interact with textarea and Send button; confirm user + assistant message bubbles appear in conversation list

**Checkpoint**: AIChatPanel.svelte complete with local state and migrated CSS — US3 independently testable

---

## Phase 6: User Story 4 — Access Quick Actions Panel as Standalone Component (Priority: P4)

**Goal**: Extract the Quick Actions panel (4 action buttons) into a self-contained organism that calls `getContext('organism-refs')` internally and defines all handlers (`handleNewStrategy`, `handleNewBacktest`, `handleExportCSV`) within the component.

**Independent Test**: Open Storybook → Organisms/QuickActionsPanel → confirm all 4 buttons (New Strategy, New Backtest, Report, Export CSV) render; note that context-dependent actions (New Strategy, New Backtest) no-op safely in Storybook due to optional chaining.

### Implementation for User Story 4

- [x] T012 [P] [STORYBOOK] [US4] Create `src/stories/QuickActionsPanel.stories.svelte` — `defineMeta` with `title: 'Organisms/QuickActionsPanel'`, dark background; single no-arg `<Story name="Default" />`; add story note that `getContext('organism-refs')` returns `undefined` in Storybook and context-dependent actions gracefully no-op
- [x] T013 [P] [US4] Create `src/lib/components/organisms/QuickActionsPanel.svelte` — extract Quick Actions panel markup from AIReviewSidebar; import `getContext` from `svelte`, `appState` from `$lib/state/app.svelte`, `sampleTrades` and `tradesToCsv` from `$lib/data/trades`, `Button` from `$lib/components/ui/button`, `toast` from `svelte-sonner`; call `getContext<OrganismRefs>('organism-refs')` internally; define `handleNewStrategy`, `handleNewBacktest`, `handleExportCSV` within the component; no props
- [ ] T014 [US4] Verify QuickActionsPanel in Storybook — confirm all 4 buttons render with correct labels (NEW STRATEGY, NEW BACKTEST, REPORT, EXPORT CSV); no runtime errors despite undefined organism context

**Checkpoint**: QuickActionsPanel.svelte complete — US4 independently testable; all 4 organisms now verified in isolation (SC-003 satisfied)

---

## Phase 7: Polish & Integration

**Purpose**: Compose all 4 organisms into AIReviewSidebar, validate success criteria, and confirm CI gate readiness.

- [x] T015 Update `src/lib/components/organisms/AIReviewSidebar.svelte` — replace all inline panel markup with `<AIReviewPanel />`, `<ResourceCostPanel />`, `<AIChatPanel />`, `<QuickActionsPanel />`; retain `<aside>` wrapper element and its CSS classes; remove the `.scrollbar-hide` `<style>` block (already migrated to AIChatPanel in T010); import all 4 organisms
- [ ] T016 Visual browser comparison (SC-002) — run the app (`npm run dev`), compare AIReviewSidebar rendering before and after refactor; confirm layout, spacing, panel order, and styling are indistinguishable; pass if no visual regressions observed
- [x] T017 Verify SC-001 — inspect `src/lib/components/organisms/AIReviewSidebar.svelte` and confirm zero inline panel `<div>` markup remains; file should contain only `<aside>` wrapper, 4 organism imports, and no panel-level HTML
- [x] T018 Verify SC-004 — confirm `AIReviewSidebar.svelte` line count is ≤69 lines (baseline: 229 lines; ≥70% reduction required)
- [x] T019 [P] Run `npm run lint` and `npm run check` — confirm all new organism files and updated AIReviewSidebar pass TypeScript type checking and linting (ci-format-lint gate)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1; BLOCKS Phase 3 start
- **User Stories (Phases 3–6)**: All depend on Phase 2 completion; can run **fully in parallel** (different files, no inter-story dependencies)
- **Polish & Integration (Phase 7)**: Depends on **all** of Phases 3–6 complete (T015 imports all 4 organisms)

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — start after Phase 2
- **US2 (P2)**: No dependencies on other stories — parallel with US1
- **US3 (P3)**: No dependencies on other stories — parallel with US1/US2
- **US4 (P4)**: No dependencies on other stories — parallel with US1/US2/US3

### Within Each User Story (sequential)

1. `[STORYBOOK]` story (Rule 12 — precedes integration work)
2. Organism implementation
3. Storybook verification
4. → Phase 7 integration (T015) can proceed once all 4 organisms are verified

---

## Parallel Execution Example (Phases 3–6 together)

```bash
# After Phase 2 completes, all 4 user stories can be launched simultaneously:

[US1] T003 Create AIReviewPanel.stories.svelte
[US2] T006 Create ResourceCostPanel.stories.svelte    # parallel
[US3] T009 Create AIChatPanel.stories.svelte          # parallel
[US4] T012 Create QuickActionsPanel.stories.svelte    # parallel

# Then implement each organism (within each story, Storybook precedes implementation):
[US1] T004 Create AIReviewPanel.svelte
[US2] T007 Create ResourceCostPanel.svelte            # parallel
[US3] T010 Create AIChatPanel.svelte                  # parallel
[US4] T013 Create QuickActionsPanel.svelte            # parallel

# Then verify each in Storybook:
[US1] T005 Verify AIReviewPanel in Storybook
[US2] T008 Verify ResourceCostPanel in Storybook      # parallel
[US3] T011 Verify AIChatPanel in Storybook            # parallel
[US4] T014 Verify QuickActionsPanel in Storybook      # parallel

# After all 4 stories verified → Phase 7 (sequential integration):
T015 → T016 → T017 → T018 → T019
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: BDD feature file
2. Complete Phase 2: Record baseline
3. Complete Phase 3 (US1): AIReviewPanel — create story, implement, verify
4. **STOP and VALIDATE**: AIReviewPanel renders in Storybook independently
5. Proceed to remaining user stories

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1 — AIReviewPanel) → First organism ready ✅
3. Phase 4 (US2 — ResourceCostPanel) → Second organism ready ✅
4. Phase 5 (US3 — AIChatPanel) → Third organism ready ✅ (CSS migrated)
5. Phase 6 (US4 — QuickActionsPanel) → Fourth organism ready ✅
6. Phase 7 → Sidebar integration + visual verification → **Refactor complete**

---

## Notes

- `[P]` tasks in Phases 3–6 refer to parallelism **across** user stories (different files, no shared state)
- Within each story, tasks T00x (Storybook) → T00x+1 (Implement) → T00x+2 (Verify) are sequential
- T010 is the only task with a cross-cutting concern: migrating `.scrollbar-hide` CSS — must be done before T015 (integration)
- T015 depends on T004, T007, T010, T013 all being complete before AIReviewSidebar can be rewritten
- Storybook stories for self-contained organisms use no `args` — they render with internally imported sample data
- `QuickActionsPanel` context no-op behavior in Storybook is intentional and safe (all handlers use `?.` optional chaining)
