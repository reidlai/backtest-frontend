# Tasks: Extract Organisms into Dedicated Components and SvelteKit Routes

**Input**: Design documents from `/specs/004-extract-sidebar-panels/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: No automated unit/integration tests per spec; Storybook visual verification per Constitution Rule 12; manual browser comparison per SC-002, SC-005.

**BDD-First (Constitution Rule 6 — MANDATORY)**: BDD feature file MUST appear in Phase 1 and MUST precede any implementation tasks for the behaviors it describes.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[Story]**: Which user story this task belongs to (US1–US7)
- **[BDD]**: Gherkin feature file — MUST precede implementation (Rule 6)
- **[STORYBOOK]**: Storybook story — MUST precede organism integration (Rule 12)

---

## Phase 1: Setup

**Purpose**: BDD feature files documenting all panel and route behaviors — MUST complete before any implementation.

- [x] T001 [BDD] Create `features/ai-review-sidebar-panels.feature` with Gherkin scenarios for US1–US4 panel behaviors tagged `@smoke @ui`: AI Review panel renders grade/confidence/flags; Resource Cost panel renders progress bars and stats; AI Chat panel shows placeholder and sends messages; Quick Actions panel renders 4 buttons
- [x] T002 [BDD] Extend `features/ai-review-sidebar-panels.feature` with Gherkin scenarios for US5 (all 10 routes reachable; `/` redirects to `/research-workbench`), US6 (DashboardMetricGrid, AIResearchBox, FunctionGateways render in isolation; AIResearchBox writes to `strategyState.inputText` and navigates to `/strategy-builder`), and US7 (PerformanceMetricGrid tiles render; PerformancdeChartTabs defaults to equity-curve tab) — tagged `@smoke @ui`

---

## Phase 2: Foundational

**Purpose**: Shared state stores and type extensions that block multiple user stories — MUST complete before Phase 6, 7, and 8.

**⚠️ CRITICAL**: T004 and T005 block Phases 6, 7, and 8. T006 blocks Phase 7.

- [x] T003 Record pre-refactor baseline — `src/lib/components/organisms/AIReviewSidebar.svelte` has 229 lines; post-refactor target ≤69 lines (≥70% reduction per SC-004)
- [x] T004 Create `src/lib/state/strategy.svelte.ts` — export `strategyState` Svelte 5 reactive object with `inputText: $state<string>('')`, `parsedStrategy: $state<ParsedStrategy | null>(null)`, `reset()` method (clears both fields to defaults), and `getStrategyConfig()` method returning `parsedStrategy ?? sampleStrategy`; import `sampleStrategy` from `$lib/data/strategy` (FR-019)
- [x] T005 Create `src/lib/state/backtest.svelte.ts` — export `backtestState` Svelte 5 reactive object with `$state` fields: `mode` (`'Single Stock'`), `initialCapital` (`'100000'`), `startDate` (`'2020-01-01'`), `endDate` (`'2024-12-31'`), `universe` (`'SPY'`), `timeframe` (`'Daily'`), `direction` (`'Long'`), and `orderTypes` (matching current backtest-engine page defaults); export `reset()` method restoring all fields to those defaults (FR-019a)
- [x] T006 Add `path: string` field to `NavSection` interface in `src/lib/types/index.ts` — this field holds the canonical route path for each nav section (e.g., `'/research-workbench'`); do not remove `SectionId` yet (may still be used elsewhere) (FR-023)

**Checkpoint**: State stores and NavSection type ready — Phases 3–9 can proceed in parallel

---

## Phase 3: User Story 1 — View AI Review Panel as Standalone Component (Priority: P1) 🎯 MVP

**Goal**: Extract the AI Review panel (grade, confidence badge, risk flags) into a self-contained organism.

**Independent Test**: Open Storybook → Organisms/AIReviewPanel → confirm grade circle, confidence badge, and all risk flag items render without the AIReviewSidebar wrapper.

### Implementation for User Story 1

- [x] T007 [STORYBOOK] [US1] Create `src/stories/AIReviewPanel.stories.svelte` — `defineMeta` with `title: 'Organisms/AIReviewPanel'`, `tags: ['autodocs']`, dark background; single no-arg `<Story name="Default" />` (component imports sample data internally)
- [x] T008 [US1] Create `src/lib/components/organisms/AIReviewPanel.svelte` — extract AI Review panel `<div>` block from AIReviewSidebar; import `sampleAIReview` from `$lib/data/strategy`, `Badge` from `$lib/components/ui/badge`, `RiskFlagItem` from `$lib/components/molecules/RiskFlagItem.svelte`; no props; stateless
- [ ] T009 [US1] Verify AIReviewPanel in Storybook — confirm grade circle, confidence badge, and all risk flag items render correctly; confirm component is independently renderable without AIReviewSidebar

**Checkpoint**: AIReviewPanel complete ✅ — US1 independently testable

---

## Phase 4: User Story 2 — View Resource & Cost Panel as Standalone Component (Priority: P2)

**Goal**: Extract the Resource & Cost panel into a self-contained organism.

**Independent Test**: Open Storybook → Organisms/ResourceCostPanel → confirm both progress bars, estimated runtime, and plan impact stat grid render.

### Implementation for User Story 2

- [x] T010 [P] [STORYBOOK] [US2] Create `src/stories/ResourceCostPanel.stories.svelte` — `defineMeta` with `title: 'Organisms/ResourceCostPanel'`, dark background; single no-arg `<Story name="Default" />`
- [x] T011 [P] [US2] Create `src/lib/components/organisms/ResourceCostPanel.svelte` — extract Resource & Cost panel `<div>` block from AIReviewSidebar; import `sampleResourceUsage` from `$lib/data/strategy`, `Progress` from `$lib/components/ui/progress`; no props; stateless
- [ ] T012 [US2] Verify ResourceCostPanel in Storybook — confirm Tokens Used progress bar (4250/10000), Backtests progress bar (3/10), Est. Runtime (~42s), and Plan Impact (medium) render correctly

**Checkpoint**: ResourceCostPanel complete ✅ — US2 independently testable

---

## Phase 5: User Story 3 — Interact with AI Chat Panel as Standalone Component (Priority: P3)

**Goal**: Extract the AI Chat panel with local state and migrated `.scrollbar-hide` CSS into a self-contained organism.

**Independent Test**: Open Storybook → Organisms/AIChatPanel → confirm placeholder text on empty state; type a message, click Send, confirm user and assistant bubbles appear.

### Implementation for User Story 3

- [x] T013 [P] [STORYBOOK] [US3] Create `src/stories/AIChatPanel.stories.svelte` — `defineMeta` with `title: 'Organisms/AIChatPanel'`, dark background; single no-arg `<Story name="Default" />`
- [x] T014 [P] [US3] Create `src/lib/components/organisms/AIChatPanel.svelte` — extract AI Chat panel markup and logic from AIReviewSidebar; declare `messages = $state<ChatMessage[]>([])` and `chatInput = $state('')`; implement `handleSendMessage`; import `Button`, `Textarea` from `$lib/components/ui/`, `ChatMessage` type; **include `<style>` block with `.scrollbar-hide` CSS rules** migrated from AIReviewSidebar (FR-008)
- [ ] T015 [US3] Verify AIChatPanel in Storybook — confirm placeholder text renders on empty state; interact with textarea and Send button; confirm user and assistant message bubbles appear in conversation list

**Checkpoint**: AIChatPanel complete ✅ — US3 independently testable

---

## Phase 6: User Story 4 — Access Quick Actions Panel as Standalone Component (Priority: P4)

**Goal**: Update QuickActionsPanel to use `strategyState`, `backtestState`, and `goto()` — removing `organism-refs` context and `appState.activeSection` mutations.

**Independent Test**: Open Storybook → Organisms/QuickActionsPanel → confirm all 4 buttons render; `goto` calls are no-ops safely in Storybook.

**⚠️ Depends on**: T004 (strategyState), T005 (backtestState)

### Implementation for User Story 4

- [x] T016 [P] [STORYBOOK] [US4] Create `src/stories/QuickActionsPanel.stories.svelte` — `defineMeta` with `title: 'Organisms/QuickActionsPanel'`, dark background; single no-arg `<Story name="Default" />`; add story note that `goto` is mocked as no-op in Storybook and navigation actions gracefully no-op
- [x] T017 [P] [US4] Update `src/lib/components/organisms/QuickActionsPanel.svelte` — remove `getContext('organism-refs')` call and `OrganismRefs` interface declaration; import `strategyState` from `$lib/state/strategy.svelte`, `backtestState` from `$lib/state/backtest.svelte`, `goto` from `$app/navigation`; update `handleNewStrategy` to call `strategyState.reset()` then `goto('/strategy-builder')`; update `handleNewBacktest` to call `backtestState.reset()` then `goto('/backtest-engine')`; remove `appState.activeSection` mutation from Report button handler, replacing with `goto('/performance-result')` (FR-004, FR-019b, FR-020)
- [ ] T018 [US4] Verify QuickActionsPanel in Storybook — confirm all 4 buttons render with correct labels (NEW STRATEGY, NEW BACKTEST, REPORT, EXPORT CSV); no runtime errors despite mocked goto

**Checkpoint**: QuickActionsPanel updated — organism-refs removed from this component

---

## Phase 7: User Story 5 — Navigate to Each Section via Dedicated SvelteKit Route (Priority: P1)

**Goal**: Wire up SvelteKit routing end-to-end — fix defects, add redirect, update nav components to use anchor tags and `section.path`, migrate all `appState.activeSection` to `goto()`, and remove `organism-refs` and `activeSection` entirely.

**Independent Test**: Open the running browser at each of the 10 route paths — all render without errors. Navigating to `/` immediately redirects to `/research-workbench`.

**⚠️ Depends on**: T004 (strategyState), T005 (backtestState), T006 (NavSection.path)

### Defect Fixes (FR-017, FR-018)

- [x] T019 [US5] Fix market-regime route directory — rename `src/routes/ market-regime/` (with leading space) to `src/routes/market-regime/` so the route is accessible at `/market-regime` in the running browser; use `git mv` to preserve history (FR-017, SC-009)
- [x] T020 [US5] Fix `src/routes/market-regime/+page.svelte` import — change `'../molecules/RegimeCard.svelte'` to `'$lib/components/molecules/RegimeCard.svelte'`; run `npm run check` to confirm no type errors (FR-018, SC-010)

### Root Route & Layout (FR-010a)

- [x] T021 [US5] Create `src/routes/+page.server.ts` — export `load()` function containing `throw redirect(307, '/research-workbench')` with `redirect` imported from `@sveltejs/kit`; this triggers a server-side redirect before any rendering occurs (FR-010a, SC-006a)
- [x] T022 [US5] Strip `src/routes/+page.svelte` — remove all section-switching markup, `setContext('organism-refs', ...)` call, `strategyBuilderRef` and `backtestRef` declarations, and all `appState.activeSection` conditional display logic; leave file as a minimal empty `<script>` component (FR-010a, FR-019b, SC-006a)

### NavSection Definitions (FR-023, FR-024)

- [x] T023 [US5] Update `src/lib/components/organisms/MainMenuGroup.svelte` — add `path` field to each section definition: `{ id: 'dashboard', path: '/research-workbench', ... }`, `{ id: 'strategy-builder', path: '/strategy-builder', ... }`, `{ id: 'fundamental-screener', path: '/fundamental-screener', ... }`, `{ id: 'technical-screener', path: '/technical-screener', ... }`, `{ id: 'market-regime', path: '/market-regime', ... }`, `{ id: 'sentiment-events', path: '/sentiment-events', ... }` (FR-023)
- [x] T024 [US5] Update `src/lib/components/organisms/ResultMenuGroup.svelte` — add `path` field to each section definition: `{ id: 'performance-result', path: '/performance-result', ... }`, `{ id: 'backtest-engine', path: '/backtest-engine', ... }`, `{ id: 'trade-log', path: '/trade-lot', ... }`, `{ id: 'settings-billing', path: '/setting-billing', ... }` (FR-023)

### Navigation Components (FR-010b, FR-020, FR-021)

- [x] T025 [US5] Update `src/lib/components/organisms/MainMenuGroup.svelte` — replace all `onclick={appState.activeSection = section.id}` button handlers with `<a href={section.path}>` anchor tags; replace `appState.activeSection === section.id` active-state checks with `page.url.pathname === section.path` using `page` from `$app/state`; remove `appState` import if no longer used; **also read `src/lib/components/organisms/NavigationSidebar.svelte`** — if it contains any `appState.activeSection` logic independent of MainMenuGroup/ResultMenuGroup, fix it in this same task (FR-010b, FR-020, FR-021, FR-024, SC-007a)
- [x] T026 [US5] Update `src/lib/components/organisms/ResultMenuGroup.svelte` — same as T025: replace onclick handlers with `<a href={section.path}>` anchor tags; replace active-state check with `page.url.pathname === section.path`; remove `appState` import if no longer used (FR-010b, FR-020, FR-021, FR-024, SC-007a)

### appState.activeSection Migration (FR-019, FR-019b, FR-020, FR-022)

- [x] T027 [US5] Update `src/lib/components/organisms/TopBar.svelte` — remove `getContext('organism-refs')` call and `OrganismRefs` interface declaration; import `strategyState` from `$lib/state/strategy.svelte`, `goto` from `$app/navigation`; replace `appState.activeSection = 'strategy-builder'` with `goto('/strategy-builder')`; replace organism-refs-based `getStrategyConfig` call with `strategyState.getStrategyConfig()`; remove `appState` import if no longer used (FR-019b, FR-020)
- [x] T028 [US5] Update `src/routes/strategy-builder/+page.svelte` — import `strategyState` from `$lib/state/strategy.svelte`, `goto` from `$app/navigation`; bind textarea to `strategyState.inputText`; write parsed result to `strategyState.parsedStrategy`; replace all 3× `appState.activeSection = '...'` mutations with `goto('/path')` calls; remove any exported page functions (they move to strategyState); remove `appState` import if no longer used (FR-019, FR-020)
- [x] T029 [US5] Update `src/routes/backtest-engine/+page.svelte` — import `backtestState` from `$lib/state/backtest.svelte`; bind all form inputs to `backtestState` fields (`mode`, `initialCapital`, `startDate`, `endDate`, `universe`, `timeframe`, `direction`, `orderTypes`) instead of local `$state` variables; remove local state declarations (FR-019a)
- [x] T030 [US5] Update `src/routes/fundamental-screener/+page.svelte` — import `goto` from `$app/navigation`; replace `appState.activeSection = 'backtest-engine'` with `goto('/backtest-engine')`; remove `appState` import if no longer used (FR-020)
- [x] T031 [US5] Update `src/routes/trade-lot/+page.svelte` — import `goto` from `$app/navigation`; replace both occurrences of `appState.activeSection = 'backtest-engine'` with `goto('/backtest-engine')`; remove `appState` import if no longer used (FR-020)
- [x] T032 [US5] Update `src/routes/performance-result/+page.svelte` — import `goto` from `$app/navigation`; replace `appState.activeSection = 'backtest-engine'` with `goto('/backtest-engine')`; remove `appState` import if no longer used (FR-020)
- [x] T033 [US5] Remove `activeSection` field and `strategyInputText` field from `src/lib/state/app.svelte.ts` (FR-022, FR-019); then audit `src/lib/types/index.ts` — if `SectionId` type has zero remaining usages after FR-022, remove it from `index.ts` as well; run `grep -r "SectionId\|activeSection\|strategyInputText" src/` first to confirm no callers remain before deleting (SC-012)

### Cleanup (FR-011)

- [x] T034 [US5] Delete original section organism files from `src/lib/components/organisms/` — files no longer present on disk: `BacktestEngineSection.svelte`, `DashboardSection.svelte`, `FundamentalScreenerSection.svelte`, `MarketRegimeSection.svelte`, `PerformanceResultSection.svelte`, `SentimentEventsSection.svelte`, `SettingsBillingSection.svelte`, `StrategyBuilderSection.svelte`, `TechnicalScreenerSection.svelte`, `TradeLogSection.svelte` — stage deletions with `git rm` if not already staged (FR-011, SC-007)

### AIReviewSidebar Composition (FR-005)

- [x] T035 [US5] Update `src/lib/components/organisms/AIReviewSidebar.svelte` — replace all inline panel markup with `<AIReviewPanel />`, `<ResourceCostPanel />`, `<AIChatPanel />`, `<QuickActionsPanel />`; retain `<aside>` wrapper and its CSS classes; remove the `.scrollbar-hide` `<style>` block (migrated to AIChatPanel in T014); import all 4 organisms (FR-005, SC-001, SC-004)
- [x] T035a [US5] Verify SC-006 — run `grep -n "activeSection\|style:display\|{#if\|{:else" src/routes/+layout.svelte` and confirm zero results; the layout must contain only the 3-column wrapper, `<NavigationSidebar />`, `{@render children()}`, and `<AIReviewSidebar />` with no conditional section-switching logic (FR-010, SC-006)

**Checkpoint**: All 10 routes accessible; all `appState.activeSection` mutations replaced; `organism-refs` removed; `activeSection` field removed; SC-006 verified

---

## Phase 8: User Story 6 — Research Workbench Composes Dedicated Sub-Organisms (Priority: P2)

**Goal**: Update `AIResearchBox` and `FunctionGateways` to use `strategyState`/`goto()`; add Storybook stories for all three Research Workbench organisms.

**Independent Test**: Open Storybook → each of DashboardMetricGrid, AIResearchBox, FunctionGateways renders in isolation without the Research Workbench route page.

**⚠️ Depends on**: T004 (strategyState for AIResearchBox)

### Implementation for User Story 6

- [x] T036 [P] [STORYBOOK] [US6] Create `src/stories/DashboardMetricGrid.stories.svelte` — `defineMeta` with `title: 'Organisms/DashboardMetricGrid'`, dark background; single no-arg `<Story name="Default" />` (component reads from `sampleMarketMetrics` internally)
- [x] T037 [P] [STORYBOOK] [US6] Create `src/stories/AIResearchBox.stories.svelte` — `defineMeta` with `title: 'Organisms/AIResearchBox'`, dark background; single no-arg `<Story name="Default" />`; mock `goto` from `$app/navigation` as a no-op; add story note that navigation is suppressed in Storybook (FR-013)
- [x] T038 [P] [STORYBOOK] [US6] Create `src/stories/FunctionGateways.stories.svelte` — `defineMeta` with `title: 'Organisms/FunctionGateways'`, dark background; single no-arg `<Story name="Default" />`; mock `goto` from `$app/navigation` as a no-op; add story note that navigation is suppressed in Storybook (FR-014)
- [x] T039 [P] [US6] Update `src/lib/components/organisms/AIResearchBox.svelte` — import `strategyState` from `$lib/state/strategy.svelte`, `goto` from `$app/navigation`; replace `appState.strategyInputText = text` with `strategyState.inputText = text.trim()`; replace `appState.activeSection = 'strategy-builder'` with `goto('/strategy-builder')`; retain local `aiText` and `validationError` state; remove `appState` import if no longer used (FR-013, FR-020)
- [x] T040 [P] [US6] Update `src/lib/components/organisms/FunctionGateways.svelte` — import `goto` from `$app/navigation`; replace `appState.activeSection = id` mutation with `goto('/' + card.id)` (gateway card IDs match route paths directly); remove `appState` import if no longer used (FR-014, FR-020)
- [ ] T041 [US6] Verify DashboardMetricGrid in Storybook — first run `grep "appState\|activeSection" src/lib/components/organisms/DashboardMetricGrid.svelte` to confirm no `appState` dependency; then confirm all 4 market metric tiles display with correct labels and values from `sampleMarketMetrics` in Storybook (FR-012)
- [ ] T042 [US6] Verify AIResearchBox in Storybook — confirm text input and submit button render; story note about suppressed navigation is visible; no runtime errors
- [ ] T043 [US6] Verify FunctionGateways in Storybook — confirm all gateway cards render; story note about suppressed navigation is visible; no runtime errors

**Checkpoint**: All Research Workbench sub-organisms Storybook-verified — US6 independently testable (SC-008 partial)

---

## Phase 9: User Story 7 — Performance Result Composes Dedicated Sub-Organisms (Priority: P3)

**Goal**: Add Storybook stories for PerformanceMetricGrid and PerformancdeChartTabs and verify they render independently.

**Independent Test**: Open Storybook → Organisms/PerformanceMetricGrid and Organisms/PerformancdeChartTabs each render without the Performance Result route page.

### Implementation for User Story 7

- [x] T044 [P] [STORYBOOK] [US7] Create `src/stories/PerformanceMetricGrid.stories.svelte` — `defineMeta` with `title: 'Organisms/PerformanceMetricGrid'`, dark background; single no-arg `<Story name="Default" />` (component manages its own local `tiles` state initialized from `defaultMetricTiles`)
- [x] T045 [P] [STORYBOOK] [US7] Create `src/stories/PerformancdeChartTabs.stories.svelte` — `defineMeta` with `title: 'Organisms/PerformancdeChartTabs'`, dark background (note: filename preserves typo intentionally per spec assumptions); single no-arg `<Story name="Default" />` (component reads from `sampleBacktestResult` and manages local `activeChartTab` state)
- [ ] T046 [US7] Verify PerformanceMetricGrid in Storybook — first run `grep "appState\|activeSection" src/lib/components/organisms/PerformanceMetricGrid.svelte` to confirm no `appState` dependency; then confirm metric tiles render with labels, values, and change indicators from `defaultMetricTiles`; draggable interactions available (FR-015)
- [ ] T047 [US7] Verify PerformancdeChartTabs in Storybook — first run `grep "appState\|activeSection" src/lib/components/organisms/PerformancdeChartTabs.svelte` to confirm no `appState` dependency; then confirm `equity-curve` tab is active by default and chart renders without errors (FR-016)

**Checkpoint**: Performance Result sub-organisms Storybook-verified — all 7 user stories independently testable (SC-003, SC-008)

---

## Phase 10: Polish & Integration

**Purpose**: End-to-end visual verification and success criteria validation.

- [ ] T048 Visual browser comparison SC-002 — run `npm run dev`, compare AIReviewSidebar rendering before and after refactor (use git stash or screenshots); pass if layout, spacing, panel order, and styling are indistinguishable
- [ ] T049 Visual browser comparison SC-005 — with `npm run dev` running, open all 10 route paths (`/backtest-engine`, `/research-workbench`, `/fundamental-screener`, `/market-regime`, `/performance-result`, `/sentiment-events`, `/setting-billing`, `/strategy-builder`, `/technical-screener`, `/trade-lot`) in the browser and confirm all render without errors; confirm navigating to `/` redirects to `/research-workbench` (SC-005, SC-006a, SC-009)
- [x] T050 Verify SC-001 — inspect `src/lib/components/organisms/AIReviewSidebar.svelte` and confirm zero inline panel `<div>` markup remains; file contains only `<aside>` wrapper, 4 organism imports, and no panel-level HTML
- [x] T051 Verify SC-004 — confirm `AIReviewSidebar.svelte` line count is ≤69 lines (baseline: 229 lines; ≥70% reduction required)
- [x] T052 Verify SC-007 — confirm all 10 original section organism `.svelte` files are deleted from `src/lib/components/organisms/` and staged for deletion in git
- [x] T053 Verify SC-012 — run `grep -r "activeSection" src/` and confirm zero results across all source files
- [x] T054 Verify SC-011a — run `grep -r "organism-refs\|OrganismRefs" src/` and confirm zero results
- [x] T055 Verify SC-013 — confirm `NavSection` type has `path: string` field; all 10 nav section definitions include correct `path` values; navigate via each nav link in the running browser and confirm correct route loads (including `/research-workbench` for dashboard and `/trade-lot` for trade-log)
- [x] T056 [P] Run `npm run lint` and `npm run check` — confirm all new and modified files pass TypeScript type checking and linting with zero errors (SC-010, CI gate)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1; T004 and T005 BLOCK Phases 6, 7, and 8; T006 BLOCKS Phase 7
- **US1–US3 (Phases 3–5)**: Depend on Phase 2 (baseline only); can run fully in parallel with each other
- **US4 (Phase 6)**: Depends on T004 (strategyState) and T005 (backtestState)
- **US5 (Phase 7)**: Depends on T004, T005, T006 — can begin after all foundational tasks complete
- **US6 (Phase 8)**: Depends on T004 (strategyState for AIResearchBox); parallel with US5
- **US7 (Phase 9)**: No dependencies on state stores — can run in parallel with US6
- **Polish (Phase 10)**: Depends on all Phases 3–9 complete

### User Story Dependencies

- **US1 (P1)**: No story-level dependencies — start after Phase 2
- **US2 (P2)**: No story-level dependencies — parallel with US1
- **US3 (P3)**: No story-level dependencies — parallel with US1/US2
- **US4 (P4)**: Depends on T004, T005 (strategy/backtest stores)
- **US5 (P1)**: Depends on T004, T005, T006 (stores + NavSection type)
- **US6 (P2)**: Depends on T004 (strategyState)
- **US7 (P3)**: No store dependencies — parallel with US6

### Within Each User Story (sequential)

1. `[STORYBOOK]` story (Rule 12 — precedes integration work)
2. Organism implementation or update
3. Storybook verification
4. → Phase 10 integration can proceed once all 7 stories are verified

---

## Parallel Execution Example (after Phase 2)

```bash
# US1–US3 Storybook verifications can run in parallel immediately:
[US1] T009 Verify AIReviewPanel in Storybook
[US2] T012 Verify ResourceCostPanel in Storybook      # parallel
[US3] T015 Verify AIChatPanel in Storybook            # parallel

# After T004+T005 complete — US4 and US6 start:
[US4] T017 Update QuickActionsPanel.svelte
[US6] T036 Create DashboardMetricGrid.stories.svelte  # parallel
[US6] T037 Create AIResearchBox.stories.svelte        # parallel
[US6] T038 Create FunctionGateways.stories.svelte     # parallel
[US6] T039 Update AIResearchBox.svelte                # parallel
[US6] T040 Update FunctionGateways.svelte             # parallel

# US7 stories (no deps — parallel with US6):
[US7] T044 Create PerformanceMetricGrid.stories.svelte
[US7] T045 Create PerformancdeChartTabs.stories.svelte  # parallel

# After T004+T005+T006 complete — US5 defect fixes and root route (parallelizable):
[US5] T019 Fix market-regime directory
[US5] T020 Fix market-regime import                   # parallel
[US5] T021 Create +page.server.ts redirect
[US5] T022 Strip +page.svelte                         # parallel
[US5] T023 Update MainMenuGroup (path field + anchors)
[US5] T024 Update ResultMenuGroup (path field + anchors)  # parallel
[US5] T027 Update TopBar.svelte
[US5] T028 Update strategy-builder/+page.svelte
[US5] T029 Update backtest-engine/+page.svelte        # parallel
[US5] T030 Update fundamental-screener/+page.svelte   # parallel
[US5] T031 Update trade-lot/+page.svelte              # parallel
[US5] T032 Update performance-result/+page.svelte     # parallel
```

---

## Implementation Strategy

### MVP First (US1 + US5 — both P1)

1. Complete Phase 1: BDD feature files
2. Complete Phase 2: Foundational state stores and NavSection type
3. Complete Phase 3 (US1): AIReviewPanel — verify in Storybook
4. Complete Phase 7 (US5): Route conversion — all 10 routes accessible
5. **STOP and VALIDATE**: All routes work in browser; AIReviewPanel renders in Storybook
6. Proceed to remaining user stories

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1 — AIReviewPanel) ✅ (already done except Storybook verification)
3. Phase 4 (US2 — ResourceCostPanel) ✅ (already done except Storybook verification)
4. Phase 5 (US3 — AIChatPanel) ✅ (already done except Storybook verification)
5. Phase 6 (US4 — QuickActionsPanel update) → QuickActionsPanel uses strategyState/backtestState
6. Phase 7 (US5 — Route Conversion) → All 10 routes accessible, navigation works, appState.activeSection removed
7. Phase 8 (US6 — Research Workbench) → DashboardMetricGrid, AIResearchBox, FunctionGateways Storybook-verified
8. Phase 9 (US7 — Performance Result) → PerformanceMetricGrid, PerformancdeChartTabs Storybook-verified
9. Phase 10 → End-to-end verification → **Refactor complete**

---

## Notes

- `[P]` tasks in Phases 8–9 refer to parallelism across story files (different files, no shared state)
- Within each story, the order is: `[STORYBOOK]` → Implement/Update → Verify (sequential)
- T033: `activeSection` and `strategyInputText` are removed from `src/lib/state/app.svelte.ts`; `SectionId` type is audited and removed from `src/lib/types/index.ts` if unused
- T034 section organism deletions: files are already removed from disk; use `git rm` to stage deletions
- T035a verifies SC-006 (layout.svelte has no conditional section-switching) — already done in prior work but untracked until now
- T035 (AIReviewSidebar composition) is already complete per prior implementation
- **goto mock pattern** for T037/T038 stories: inside `<script module lang="ts">`, add `import * as nav from '$app/navigation'; (nav as any).goto = () => {};` before `defineMeta`; add a paragraph story note "Navigation is suppressed in Storybook — goto calls are no-ops"
- `PerformancdeChartTabs` filename typo is intentionally preserved in this branch (spec assumption); correct in a follow-up branch
- Storybook stories for modified navigation organisms (`MainMenuGroup`, `ResultMenuGroup`, `NavigationSidebar`) are deferred to a follow-up branch
- T019 must use `git mv` (not filesystem rename) to preserve git history for the market-regime route
