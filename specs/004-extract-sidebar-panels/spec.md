# Feature Specification: Extract Organisms into Dedicated Components and SvelteKit Routes

**Feature Branch**: `004-extract-sidebar-panels`

**Created**: 2026-05-23

**Status**: In Progress

**Input**: (1) Extract inline panels from `AIReviewSidebar.svelte` into dedicated organism components and compose them back into the sidebar. (2) Convert each main section organism into a dedicated SvelteKit `+page.svelte` route, update the app layout to use SvelteKit routing, and extract additional sub-organisms for the Research Workbench and Performance Result pages.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View AI Review Panel as Standalone Component (Priority: P1)

A developer navigating the codebase can locate, read, and modify the AI Review panel (confidence badge, strategy grade, and risk flags) as a dedicated, self-contained organism component without having to parse the full sidebar file.

**Why this priority**: The AI Review panel is the primary feature of the sidebar and is most likely to receive independent updates (e.g., new confidence levels, additional risk flag types). Isolating it first delivers the highest maintenance value.

**Independent Test**: Can be fully tested by rendering only the AI Review organism in isolation and verifying the grade, confidence badge, and risk flag list appear correctly.

**Acceptance Scenarios**:

1. **Given** the AIReviewSidebar is rendered, **When** a developer opens the AI Review organism file, **Then** it contains only the AI Review panel markup and its directly related logic.
2. **Given** the AI Review organism exists, **When** it is imported into AIReviewSidebar, **Then** the sidebar renders identically to the original.

---

### User Story 2 - View Resource & Cost Panel as Standalone Component (Priority: P2)

A developer can find and update the Resource & Cost panel (token usage, backtest usage, estimated runtime, plan impact) as its own organism without touching other sidebar panels.

**Why this priority**: Resource and cost tracking may evolve independently as billing features are added, making isolation important for focused changes.

**Independent Test**: Can be fully tested by rendering only the Resource & Cost organism and verifying token progress bars, backtest progress bars, and the stat grid display correctly.

**Acceptance Scenarios**:

1. **Given** the Resource & Cost organism exists, **When** rendered in isolation, **Then** it displays token usage, backtest usage, estimated runtime, and plan impact.
2. **Given** the organism is imported into AIReviewSidebar, **Then** the layout and data remain unchanged compared to the original sidebar.

---

### User Story 3 - Interact with AI Chat Panel as Standalone Component (Priority: P3)

A developer or tester can work with the AI Chat panel (message list, text input, send button) as a dedicated organism that manages its own local message state.

**Why this priority**: The chat panel has interactive state (message history, input value) that is independent of the other panels, making it a natural boundary for encapsulation.

**Independent Test**: Can be fully tested by rendering only the AI Chat organism, sending a message, and verifying the user and assistant messages appear in the conversation list.

**Acceptance Scenarios**:

1. **Given** the AI Chat organism is rendered, **When** a user types a message and clicks Send, **Then** the user message and a simulated assistant reply appear in the message list.
2. **Given** an empty chat state, **When** no messages exist, **Then** the placeholder prompt text is displayed.

---

### User Story 4 - Access Quick Actions Panel as Standalone Component (Priority: P4)

A developer can locate and modify the Quick Actions panel (New Strategy, New Backtest, Report, Export CSV) as its own organism without opening the full sidebar file.

**Why this priority**: Quick actions may be reused or extended in other layouts; extracting them allows future reuse and simplifies the sidebar container.

**Independent Test**: Can be fully tested by rendering only the Quick Actions organism and verifying all four action buttons appear and trigger the expected callbacks.

**Acceptance Scenarios**:

1. **Given** the Quick Actions organism is rendered, **When** each button is clicked, **Then** the corresponding action (reset strategy, reset backtest, navigate to report, export CSV) is triggered.
2. **Given** the organism is imported into AIReviewSidebar, **Then** all actions behave identically to the original implementation.

---

---

### User Story 5 - Navigate to Each Section via Dedicated SvelteKit Route (Priority: P1)

A user can navigate to any of the 10 main application sections by visiting its canonical URL path, with each section rendering as an independent SvelteKit page rather than being conditionally shown inside a monolithic layout component.

**Why this priority**: Dedicated routes unlock browser-native navigation (back/forward, deep-linking, bookmarking) and allow each section to be developed and tested in isolation. This is the foundational change that enables all subsequent section improvements.

**Independent Test**: Open the browser at each route path and confirm the section content renders without the app needing to perform any client-side section switching.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** a user navigates to `/backtest-engine`, **Then** the Backtest Engine form renders as the main content area.
2. **Given** the app is running, **When** a user navigates to `/research-workbench`, **Then** the Research Workbench page renders with metric grid, AI research box, and gateway cards.
3. **Given** the app is running, **When** a user navigates to `/fundamental-screener`, **Then** the Fundamental Screener filter form and results table render.
4. **Given** the app is running, **When** a user navigates to `/market-regime`, **Then** the Market Regime AI summary and regime cards render.
5. **Given** the app is running, **When** a user navigates to `/performance-result`, **Then** the Performance Result metric grid and chart tabs render.
6. **Given** the app is running, **When** a user navigates to `/sentiment-events`, **Then** the Sentiment Events table renders.
7. **Given** the app is running, **When** a user navigates to `/setting-billing`, **Then** the Settings & Billing cards render.
8. **Given** the app is running, **When** a user navigates to `/strategy-builder`, **Then** the Strategy Builder textarea and parsed strategy table render.
9. **Given** the app is running, **When** a user navigates to `/technical-screener`, **Then** the Technical Screener pattern selector and chart preview render.
10. **Given** the app is running, **When** a user navigates to `/trade-lot`, **Then** the Trade Log table renders.

---

### User Story 6 - Research Workbench Composes Dedicated Sub-Organisms (Priority: P2)

A developer can locate and modify the individual content blocks of the Research Workbench (market metrics grid, AI research input, function gateway cards) as separate, self-contained organism files rather than inline markup in a monolithic section component.

**Why this priority**: The Research Workbench is the landing page and aggregates functionally distinct blocks — each should be independently maintainable and Storybook-verifiable.

**Independent Test**: Each of the three sub-organisms (DashboardMetricGrid, AIResearchBox, FunctionGateways) can be rendered in Storybook without the Research Workbench route page.

**Acceptance Scenarios**:

1. **Given** DashboardMetricGrid is rendered, **When** viewed in isolation, **Then** all four market metric tiles display with correct labels and values.
2. **Given** AIResearchBox is rendered, **When** a user enters text and submits, **Then** the text is written to `strategyState.inputText` and `goto('/strategy-builder')` navigates the browser to the Strategy Builder route.
3. **Given** AIResearchBox is rendered, **When** a user submits with an empty input, **Then** a validation error is shown and no navigation occurs.
4. **Given** FunctionGateways is rendered, **When** a user clicks a gateway card, **Then** `goto('/' + card.id)` navigates the browser to the corresponding section route.

---

### User Story 7 - Performance Result Composes Dedicated Sub-Organisms (Priority: P3)

A developer can modify the metric tile grid and the chart tab view of the Performance Result page independently, as each is its own organism component.

**Why this priority**: The Performance Result page contains interactive features (draggable tiles, chart tabs) that benefit from isolated component scope to avoid state bleed.

**Independent Test**: PerformanceMetricGrid and PerformancdeChartTabs each render in Storybook without the Performance Result route page.

**Acceptance Scenarios**:

1. **Given** PerformanceMetricGrid is rendered, **When** tiles are displayed, **Then** each tile shows its metric label, value, and change indicator from `defaultMetricTiles`.
2. **Given** PerformancdeChartTabs is rendered, **When** the component mounts, **Then** the equity curve chart tab is active by default and the chart renders without errors.

---

### Edge Cases

- When AIReviewSidebar composes all four extracted organisms, overall layout, spacing, and scroll behavior must remain identical to the pre-refactor state — verified by the manual browser comparison defined in SC-002.
- When AIChatPanel is unmounted and remounted, the message list and input value reset to empty — this is expected behavior, matching the natural Svelte 5 `$state` per-instance lifecycle. No persistence mechanism is required.
- When a panel organism's sample data contains empty arrays or zero values (e.g., `riskFlags: []`, `tokensUsed: 0`), it renders with those empty/zero values and produces no errors — no conditional hiding or placeholder text is added, matching current sidebar behavior.
- The `market-regime` route directory MUST be named exactly `market-regime` (no leading space). The current directory `" market-regime"` (with a leading space) is a naming defect that produces an inaccessible route and must be corrected before SC-005 can pass.
- The market-regime `+page.svelte` currently imports `RegimeCard` via a relative path (`../molecules/RegimeCard.svelte`), which is invalid from a route file's location; it must use the `$lib` alias (`$lib/components/molecules/RegimeCard.svelte`).
- When a section route page is loaded directly in the browser (hard refresh or deep link), the NavigationSidebar and AIReviewSidebar must render correctly alongside the route content via the shared `+layout.svelte`.
- When a user visits `/`, they are immediately redirected to `/research-workbench` — no flash of blank content or 404 page is acceptable.

## Requirements _(mandatory)_

### Functional Requirements

#### Part A — AIReviewSidebar Panel Extraction

- **FR-001**: System MUST extract the AI Review panel into a dedicated, self-contained organism component that encapsulates its own markup and display logic.
- **FR-002**: System MUST extract the Resource & Cost panel into a dedicated, self-contained organism component that imports `sampleResourceUsage` directly and renders progress indicators and stats with no props from the sidebar.
- **FR-003**: System MUST extract the AI Chat panel into a dedicated organism component that owns its local message state and send-message behavior.
- **FR-004**: System MUST extract the Quick Actions panel into a dedicated, self-contained organism component that imports `strategyState`, `backtestState`, `sampleTrades`, and `tradesToCsv` directly. Action handlers (`handleNewStrategy`, `handleNewBacktest`, `handleExportCSV`) are defined within the component — no props from the sidebar and no `organism-refs` context.
- **FR-005**: System MUST update AIReviewSidebar to import and compose the four extracted organisms, replacing all inline panel markup. The `<aside>` wrapper element and its CSS classes remain in AIReviewSidebar.
- **FR-006**: System MUST ensure the visual appearance and interactive behavior of AIReviewSidebar remains identical after the refactor.
- **FR-007**: Each extracted organism MUST be independently renderable without depending on the AIReviewSidebar wrapper.
- **FR-008**: The `.scrollbar-hide` CSS styles currently in AIReviewSidebar's `<style>` block MUST be moved to `AIChatPanel.svelte`'s own `<style>` block, as Svelte component-scoped CSS will not apply across component boundaries.

#### Part B — Section Organism to SvelteKit Route Conversion

- **FR-009**: System MUST convert each of the 10 main section organisms into a dedicated SvelteKit `+page.svelte` at its canonical route path: `BacktestEngineSection` → `/backtest-engine`, `DashboardSection` → `/research-workbench`, `FundamentalScreenerSection` → `/fundamental-screener`, `MarketRegimeSection` → `/market-regime`, `PerformanceResultSection` → `/performance-result`, `SentimentEventsSection` → `/sentiment-events`, `SettingsBillingSection` → `/setting-billing`, `StrategyBuilderSection` → `/strategy-builder`, `TechnicalScreenerSection` → `/technical-screener`, `TradeLogSection` → `/trade-lot`.
- **FR-010**: System MUST update `src/routes/+layout.svelte` to render section content via SvelteKit's `{@render children()}` slot mechanism, removing any conditional section-switching logic from the layout.
- **FR-010a**: System MUST add `src/routes/+page.server.ts` that executes `redirect(307, '/research-workbench')`, so visiting `/` redirects server-side before any rendering occurs. `src/routes/+page.svelte` MUST be stripped of all section-switching markup and `appState.activeSection` conditional display logic; it remains as a minimal empty component (no inline section content).
- **FR-010b**: System MUST update `NavigationSidebar.svelte` (and its `MainMenuGroup`/`ResultMenuGroup` sub-components) to replace all section-switching buttons with `<a href={section.path}>` anchor tags using the `path` field from `NavSection` (FR-023). Active-state highlighting MUST use `page.url.pathname === section.path` from `$app/state`.
- **FR-010c**: _(Superseded by FR-019b — organism-refs is removed entirely rather than relocated.)_
- **FR-011**: The original section organism `.svelte` files MUST be deleted after their content is migrated to the corresponding route pages.

#### Part C — Research Workbench Sub-Organism Extraction

- **FR-012**: System MUST extract `DashboardMetricGrid` as a self-contained organism that reads from `sampleMarketMetrics` and renders a 4-column grid of `MetricTile` components; no props.
- **FR-013**: System MUST extract `AIResearchBox` as a self-contained organism that manages local `aiText` and `validationError` state, validates non-empty input, writes the trimmed text to `strategyState.inputText` (not `appState.strategyInputText`), and calls `goto('/strategy-builder')` from `$app/navigation`. Its Storybook story MUST mock `goto` as a no-op with a story note that navigation is suppressed.
- **FR-014**: System MUST extract `FunctionGateways` as a self-contained organism that renders gateway cards from a static internal list and calls `goto('/' + card.id)` from `$app/navigation` on click (gateway card IDs match route paths directly, e.g., `'strategy-builder'` → `/strategy-builder`) — no `appState.activeSection` mutation; no props. Its Storybook story MUST mock `goto` as a no-op with a story note that navigation is suppressed.

#### Part D — Performance Result Sub-Organism Extraction

- **FR-015**: System MUST extract `PerformanceMetricGrid` as a self-contained organism that manages local `tiles` state initialized from `defaultMetricTiles` and renders a draggable grid of `MetricTile` components; no props.
- **FR-016**: System MUST extract `PerformancdeChartTabs` as a self-contained organism that manages local `activeChartTab` state, renders tabbed chart views from `sampleBacktestResult`, and defaults to the `'equity-curve'` tab; no props.

#### Part H — NavSection Data Model

- **FR-023**: System MUST add a `path: string` field to the `NavSection` type in `$lib/types/index.ts`. Each nav section definition in `MainMenuGroup.svelte` and `ResultMenuGroup.svelte` MUST be updated with its canonical route path (e.g., `{ id: 'dashboard', path: '/research-workbench', ... }`, `{ id: 'trade-log', path: '/trade-lot', ... }`, `{ id: 'settings-billing', path: '/setting-billing', ... }`).
- **FR-024**: All nav link hrefs MUST use `section.path` (e.g., `<a href={section.path}>`). Active-state checks MUST use `page.url.pathname === section.path`. No component may derive a route URL by interpolating `section.id` directly.

#### Part G — Comprehensive `appState.activeSection` Migration

- **FR-020**: System MUST replace ALL remaining `appState.activeSection = '...'` mutations across the codebase with `goto('/path')` from `$app/navigation`. Affected files: `QuickActionsPanel.svelte` (3 calls), `TopBar.svelte` (1 call), `strategy-builder/+page.svelte` (3 calls), `fundamental-screener/+page.svelte` (1 call), `trade-lot/+page.svelte` (2 calls), `performance-result/+page.svelte` (1 call), `MainMenuGroup.svelte` (active state + click handler), `ResultMenuGroup.svelte` (active state + click handler).
- **FR-021**: `MainMenuGroup.svelte` and `ResultMenuGroup.svelte` MUST replace their `appState.activeSection === section.id` active-state checks with `page.url.pathname === section.path` from `$app/state`, consistent with FR-010b and FR-024.
- **FR-022**: The `activeSection` field MUST be removed from `appState` in `$lib/state/app.svelte.ts`. Any TypeScript types (`SectionId`) used exclusively for this field MUST also be removed or deprecated if no other usages remain.

#### Part F — Strategy & Backtest State Extraction

- **FR-019**: System MUST create `$lib/state/strategy.svelte.ts` exporting a `strategyState` Svelte 5 reactive object that owns ALL strategy form state: `inputText` (formerly `appState.strategyInputText`, default `''`) and `parsedStrategy` (default `null`). The store MUST export `reset()` (sets both to defaults) and `getStrategyConfig()` (returns `parsedStrategy ?? sampleStrategy`). The `/strategy-builder` route page MUST bind its textarea to `strategyState.inputText` and write parsed results to `strategyState.parsedStrategy` instead of using local `$state`. `appState.strategyInputText` MUST be removed from `appState`. All callers (`QuickActionsPanel`, `TopBar`, `AIResearchBox`) import from `strategyState` directly.
- **FR-019a**: System MUST create `$lib/state/backtest.svelte.ts` exporting a `backtestState` Svelte 5 reactive object that owns ALL backtest form fields: `mode` (default `'Single Stock'`), `initialCapital` (default `'100000'`), `startDate` (default `'2020-01-01'`), `endDate` (default `'2024-12-31'`), `universe` (default `'SPY'`), `timeframe` (default `'Daily'`), `direction` (default `'Long'`), and `orderTypes`. The store MUST export `reset()` which restores all fields to these defaults. The `/backtest-engine` route page MUST read and write all form fields from `backtestState` instead of local `$state` variables, so that `reset()` called from any context (mounted or not) takes effect when the page renders.
- **FR-019b**: System MUST remove the `organism-refs` context entirely: delete `setContext('organism-refs', ...)` from `src/routes/+page.svelte`, remove `getContext('organism-refs')` calls from `QuickActionsPanel.svelte` and `TopBar.svelte`, and delete the local `OrganismRefs` interface declarations in both components. All functionality previously delivered via `organism-refs` is replaced by direct imports of `strategyState` and `backtestState`.

#### Part E — Defect Fixes Required Before Completion

- **FR-017**: The `market-regime` route directory MUST be renamed from `" market-regime"` (with leading space) to `market-regime` so the route is accessible at `/market-regime`.
- **FR-018**: The `market-regime/+page.svelte` import of `RegimeCard` MUST be changed from the relative path `'../molecules/RegimeCard.svelte'` to the `$lib` alias `'$lib/components/molecules/RegimeCard.svelte'`.

### Key Entities

#### AIReviewSidebar Organisms

- **AIReviewPanel**: Displays strategy grade, confidence badge, and a list of risk flags. Reads from shared AI review sample data.
- **ResourceCostPanel**: Displays token usage and backtest usage as progress bars, plus estimated runtime and plan impact stats. Reads from shared resource usage sample data.
- **AIChatPanel**: Manages a local list of chat messages; renders user and assistant bubbles; provides a text input and send button. Owns `.scrollbar-hide` CSS.
- **QuickActionsPanel**: Renders four action buttons; self-contained — imports `strategyState`, `backtestState`, `sampleTrades`, and `tradesToCsv` directly; defines `handleNewStrategy` (`strategyState.reset()` + `goto('/strategy-builder')`), `handleNewBacktest` (`backtestState.reset()` + `goto('/backtest-engine')`), and `handleExportCSV` within the component. No props; no `organism-refs`.

#### Research Workbench Organisms

- **DashboardMetricGrid**: Stateless grid of 4 `MetricTile` atoms reading from `sampleMarketMetrics`. Used by the `/research-workbench` route.
- **AIResearchBox**: Stateful AI research input organism. Validates non-empty text, writes trimmed text to `strategyState.inputText`, and calls `goto('/strategy-builder')`. Manages local `aiText` and `validationError`.
- **FunctionGateways**: Stateless grid of `FunctionGatewayCard` molecules. Calls `goto('/' + card.id)` on click — card IDs match route paths directly. Cards defined as a static internal list.

#### Performance Result Organisms

- **PerformanceMetricGrid**: Stateful organism managing a draggable array of `MetricTile` items initialized from `defaultMetricTiles`. Manages local `tiles`, `draggedIndex`, `editingTileId`, and `editValue` state.
- **PerformancdeChartTabs**: Stateful organism rendering tabbed performance charts from `sampleBacktestResult`. Manages local `activeChartTab` state; defaults to `'equity-curve'`.

#### Strategy & Backtest State

- **strategyState** (`$lib/state/strategy.svelte.ts`): Svelte 5 reactive state module that is the single source of truth for all strategy form state. Fields: `inputText` (default `''`, replaces `appState.strategyInputText`) and `parsedStrategy` (default `null`). Exports `reset()` (clears both fields) and `getStrategyConfig()` (returns `parsedStrategy ?? sampleStrategy`). The `/strategy-builder` route page binds `inputText` and writes `parsedStrategy`. Consumed by `/strategy-builder` page, `QuickActionsPanel`, `TopBar`, and `AIResearchBox`.
- **backtestState** (`$lib/state/backtest.svelte.ts`): Svelte 5 reactive state module that is the single source of truth for all backtest form fields. Fields: `mode` (`'Single Stock'`), `initialCapital` (`'100000'`), `startDate` (`'2020-01-01'`), `endDate` (`'2024-12-31'`), `universe` (`'SPY'`), `timeframe` (`'Daily'`), `direction` (`'Long'`), `orderTypes`. Exports `reset()` which restores all fields to defaults. The `/backtest-engine` route page binds form inputs directly to `backtestState` fields. Consumed by `/backtest-engine` page and `QuickActionsPanel.handleNewBacktest`.

#### Route Pages

- **`/backtest-engine`**: Backtest Engine form — mode, capital, dates, universe, timeframe, direction, order types. Imports from `appState` and `$lib/types`.
- **`/research-workbench`**: Composes `DashboardMetricGrid`, `AIResearchBox`, and `FunctionGateways`.
- **`/fundamental-screener`**: Filter form (PE max, ROIC min, revenue growth min) + results table. Navigates to backtest-engine on symbol selection.
- **`/market-regime`**: AI summary block + `RegimeCard` grid from `sampleMarketRegimes`.
- **`/performance-result`**: Composes `PerformanceMetricGrid` and `PerformancdeChartTabs`; includes save/export dialog.
- **`/sentiment-events`**: Sentiment events table with badge-coloured sentiment column from `sampleSentimentEvents`.
- **`/setting-billing`**: Two-column card layout for token usage and backtest quota from `sampleResourceUsage`.
- **`/strategy-builder`**: Strategy text input + parsed strategy table; imports `strategyState` from `$lib/state/strategy.svelte.ts` — no exported page functions.
- **`/technical-screener`**: Pattern multi-select + chart preview using `layerchart`.
- **`/trade-lot`**: Trade log table from `sampleTrades`; links to backtest-engine for new backtests.

## Success Criteria _(mandatory)_

### Measurable Outcomes

#### Part A — AIReviewSidebar Panel Extraction

- **SC-001**: All four sidebar panels are available as independently importable organism components — zero inline panel markup remains in AIReviewSidebar after refactor.
- **SC-002**: AIReviewSidebar renders pixel-identically to its pre-refactor state, verified by manual side-by-side visual comparison in the running browser — pass if layout, spacing, and styling are indistinguishable before and after the refactor.
- **SC-003**: Each panel organism can be rendered in isolation without requiring the AIReviewSidebar wrapper — all four pass standalone render checks.
- **SC-004**: The total line count of AIReviewSidebar is reduced by at least 70% compared to the pre-refactor version, reflecting successful delegation to child organisms.

#### Part B — Route Conversion

- **SC-005**: All 10 section routes (`/backtest-engine`, `/research-workbench`, `/fundamental-screener`, `/market-regime`, `/performance-result`, `/sentiment-events`, `/setting-billing`, `/strategy-builder`, `/technical-screener`, `/trade-lot`) are reachable in the running browser and render their content without errors.
- **SC-006**: `src/routes/+layout.svelte` contains no conditional section-switching logic — all content rendering is delegated to `{@render children()}`.
- **SC-006a**: Navigating to `/` in the running browser performs a server-side 307 redirect to `/research-workbench` with no flash of blank content. `src/routes/+page.server.ts` exists with the redirect; `src/routes/+page.svelte` contains no section-switching markup.
- **SC-007**: All original section organism `.svelte` files (`BacktestEngineSection`, `DashboardSection`, `FundamentalScreenerSection`, `MarketRegimeSection`, `PerformanceResultSection`, `SentimentEventsSection`, `SettingsBillingSection`, `StrategyBuilderSection`, `TechnicalScreenerSection`, `TradeLogSection`) are deleted from `src/lib/components/organisms/`.
- **SC-007a**: `NavigationSidebar.svelte` contains only `<a href="/...">` anchor tags for section links (no `onclick` section-switching handlers); the active nav item is highlighted based on `page.url.pathname`.
- **SC-007b**: _(Superseded by SC-011a — organism-refs is removed, not relocated.)_

#### Part C/D — Sub-Organism Extraction

- **SC-008**: `DashboardMetricGrid`, `AIResearchBox`, `FunctionGateways`, `PerformanceMetricGrid`, and `PerformancdeChartTabs` exist as standalone organism files in `src/lib/components/organisms/` and each has a corresponding Storybook story in `src/stories/`. The `AIResearchBox` and `FunctionGateways` stories mock `goto` as a no-op and include a story note that navigation is suppressed in Storybook.

#### Part F — Strategy State

- **SC-011**: `$lib/state/strategy.svelte.ts` exists and exports `strategyState` with `reset()` and `getStrategyConfig()`; `$lib/state/backtest.svelte.ts` exists and exports `backtestState` owning all form fields with `reset()`; `npm run check` passes with no type errors. Calling `backtestState.reset()` while not on the `/backtest-engine` route and then navigating to it shows the form in its default state.
- **SC-011a**: `grep -r "organism-refs\|OrganismRefs" src/` returns zero hits — the context key and its type are fully removed from all source files.

#### Part G — activeSection Migration

- **SC-012**: `grep -r "activeSection" src/` returns zero results — no `appState.activeSection` reads or writes remain anywhere in the codebase after the migration, and the field is removed from `appState`.

#### Part H — NavSection Data Model

- **SC-013**: `NavSection` type has a `path: string` field; all 10 nav section definitions include correct `path` values; navigating via each nav link in the running browser lands on the correct route (including `/research-workbench` for the dashboard entry and `/trade-lot` for the trade-log entry).

#### Part E — Defect Fixes

- **SC-009**: The market-regime route directory is named `market-regime` (no leading space) and the route is accessible at `/market-regime` in the running browser.
- **SC-010**: `market-regime/+page.svelte` imports `RegimeCard` using the `$lib` alias and `npm run check` passes with no type errors.

## Clarifications

### Session 2026-05-23 (Part A)

- Q: Should extracted organisms be self-contained (importing data/state/context directly) or receive everything as props from AIReviewSidebar? → A: Self-contained — each organism imports sample data, `appState`, and context directly; AIReviewSidebar renders child organisms with no props.
- Q: What method will be used to verify pixel-identical visual equivalence for SC-002? → A: Manual side-by-side visual comparison in the running browser.
- Q: When AIChatPanel unmounts and remounts, should the message list reset to empty or persist? → A: Reset to empty — document as expected behavior matching natural Svelte 5 `$state` per-instance lifecycle; no persistence mechanism needed.
- Q: Where should the `.scrollbar-hide` CSS styles currently in AIReviewSidebar's `<style>` block be placed after extraction? → A: Move to `AIChatPanel.svelte`'s own `<style>` block — Svelte CSS is component-scoped and must live in the same file as the markup it targets.
- Q: When a panel organism renders with empty/zero sample data (e.g., empty `riskFlags` array, zero token usage), should it hide sections, show placeholders, or render with empty/zero values? → A: Render with empty/zero values — no special empty-state handling; organisms mirror current sidebar behavior exactly.

### Session 2026-05-24 (Parts B–E)

- Q: Should organisms that trigger navigation (AIResearchBox, FunctionGateways) use `goto('/path')` or `appState.activeSection`? → A: Use `goto('/path')` from `$app/navigation` — idiomatic SvelteKit; no `appState.activeSection` mutation for navigation.
- Q: What should happen when a user visits the root path `/`? → A: `src/routes/+page.svelte` is updated (not deleted) to strip section-switching logic and redirect to `/research-workbench`.
- Q: How should `NavigationSidebar` nav links work after route conversion? → A: Replace section-switching buttons with `<a href="/section-path">` anchor tags; active state driven by `page.url.pathname` from `$app/state`.
- Q: How should `reset()` and `getStrategyConfig()` be exposed after the strategy-builder page can no longer export functions? → A: Extract to a dedicated `$lib/state/strategy.svelte.ts` module exporting a `strategyState` object; imported by both the route page and any callers.
- Q: How should Storybook stories for `AIResearchBox` and `FunctionGateways` handle `goto()` calls that are unavailable outside SvelteKit? → A: Mock `goto` as a no-op in the story file; add a story note that navigation is suppressed in Storybook (same pattern as `QuickActionsPanel` context no-op).

### Session 2026-05-24 (Part G — activeSection migration)

- Q: Should ALL remaining `appState.activeSection` mutations (QuickActionsPanel, TopBar, strategy-builder page, fundamental-screener page, trade-lot page, performance-result page, MainMenuGroup, ResultMenuGroup) be migrated to `goto()` in this feature? → A: Yes — migrate all comprehensively; no hybrid navigation state should remain.
- Q: Where should `setContext('organism-refs', ...)` live after `+page.svelte` is stripped of section-switching logic? → A: (Superseded — organism-refs is removed entirely per Session 2026-05-24 Part H.)
- Q: Should `activeSection` be removed from `appState` entirely after all usages are migrated to `goto()`? → A: Yes — remove the field and any types used exclusively for it.
- Q: Do existing navigation organisms (`MainMenuGroup`, `ResultMenuGroup`, `NavigationSidebar`) need new Storybook stories as part of this feature? → A: Deferred — structural refactors of existing organisms are out of scope for Rule 12's new-component story requirement; address in a follow-up branch.

### Session 2026-05-24 (Part H — NavSection path field)

- Q: How should the 3 mismatched `SectionId` values (`'dashboard'`→`/research-workbench`, `'trade-log'`→`/trade-lot`, `'settings-billing'`→`/setting-billing`) be resolved for anchor tag navigation? → A: Add `path: string` to `NavSection` type; nav components use `section.path` for hrefs and `page.url.pathname === section.path` for active state — `SectionId` values unchanged.
- Q: How should `organism-refs` be handled given its refs are already broken (bound to deleted section organisms)? → A: Remove `organism-refs` entirely; create `backtestState` store alongside `strategyState`; `QuickActionsPanel` and `TopBar` import directly from state stores.
- Q: Should the root `/` redirect use `goto` on mount in `+page.svelte` or a `+page.server.ts` server-side redirect? → A: `+page.server.ts` with `redirect(307, '/research-workbench')` — server-side, no flash; `+page.svelte` remains as an empty component.

### Session 2026-05-24 (State ownership)

- Q: Should `backtestState` own all backtest form fields (full store), or only provide a reset signal for local page state? → A: Full store — `backtestState` is the single source of truth for all form fields; route page binds directly to store values so `reset()` works regardless of whether the page is mounted.
- Q: Should `strategyInputText` and `parsedStrategy` move into `strategyState` (full store), removing `appState.strategyInputText`? → A: Yes — full store; `strategyState` owns `inputText` and `parsedStrategy`; `AIResearchBox` writes to `strategyState.inputText`; `appState.strategyInputText` removed.
- Q: Should route pages be self-contained (importing data directly) or receive data as props? → A: Self-contained — each route page imports its own sample data and state directly, consistent with the organism self-containment pattern established in Part A.
- Q: Should Storybook stories be created for the 5 new sub-organisms (DashboardMetricGrid, AIResearchBox, FunctionGateways, PerformanceMetricGrid, PerformancdeChartTabs)? → A: Yes — Constitution Rule 12 requires Storybook verification for all UI organisms before integration.
- Q: Should the `PerformancdeChartTabs` typo in the file name be corrected? → A: Out of scope for this feature — fix in a follow-up. The spec and tasks reference the existing filename as-is to avoid rename churn mid-branch.

## Assumptions

- The refactor is a pure structural reorganization — no new features, changed behavior, or altered data flows are introduced.
- Sample data imports (`sampleAIReview`, `sampleResourceUsage`, `sampleTrades`, `sampleMarketMetrics`, `sampleMarketRegimes`, `sampleSentimentEvents`, `sampleBacktestResult`, `defaultMetricTiles`) remain in their current locations and are consumed directly by the relevant organisms or route pages.
- `appState.strategyInputText` is removed from `appState` after its contents move to `strategyState.inputText`. `appState.backtestPrefillSymbol` remains in `appState` as it is a navigation handoff value, not form state.
- The `organism-refs` context is removed entirely. `QuickActionsPanel` and `TopBar` replace all `getContext('organism-refs')` calls with direct imports of `strategyState` and `backtestState`.
- Mobile layout or responsiveness changes are out of scope for this refactor.
- No new automated unit/integration tests are required as part of this change; Storybook visual verification (Rule 12) and manual browser comparison (SC-002, SC-005) are the acceptance criteria.
- The `PerformancdeChartTabs` filename typo is intentionally preserved in this branch to avoid unnecessary rename operations; a follow-up branch will correct it.
- Storybook stories for existing modified navigation organisms (`MainMenuGroup`, `ResultMenuGroup`, `NavigationSidebar`) are deferred to a follow-up branch — Constitution Rule 12 story creation is scoped to newly created organisms in this feature.
