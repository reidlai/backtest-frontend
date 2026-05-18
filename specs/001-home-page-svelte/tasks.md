# Tasks: Enterprise AI Backtest Platform — Main Application Page

**Input**: Design documents from `specs/001-home-page-svelte/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓  
**Tests**: No test tasks generated — spec does not require TDD; Storybook stories added in Polish phase for visual validation  
**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no cross-dependencies)
- **[Story]**: Maps task to user story (US1–US5) from spec.md
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install required packages, configure dark mode and zh-TW locale, enable shadcn-svelte

- [x] T001 Initialize shadcn-svelte — run `pnpx shadcn-svelte@latest init` (Style: Default, Base color: Slate, CSS variables: Yes); generates `components.json` at project root and `src/lib/utils.ts` with `cn()` helper
- [x] T002 Add required shadcn-svelte atom components — run `pnpx shadcn-svelte@latest add button card dialog input label select separator sonner table tabs textarea tooltip badge progress`; populates `src/lib/components/ui/` (do not hand-edit these files)
- [ ] T003 Install LayerChart and D3 — run `pnpm add layerchart d3 && pnpm add -D @types/d3`
- [ ] T004 [P] Update `project.inlang/settings.json` — add `"zh-TW"` to the `locales` array: `"locales": ["en", "zh-TW"]`
- [ ] T005 [P] Create `messages/zh-TW.json` — initial file with only the `"$schema"` key matching `messages/en.json` format; translations added incrementally per phase
- [ ] T006 Update `src/app.html` — add `class="dark"` to the `<html>` element (becomes `<html lang="%paraglide.lang%" dir="%paraglide.dir%" class="dark">`); this activates all Tailwind `dark:` utilities globally with no JavaScript toggle

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TypeScript types, mock data, global state, layout shell — MUST be complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create `src/lib/types/index.ts` — mirror all TypeScript interfaces from `specs/001-home-page-svelte/contracts/types.ts`: SectionId union, Locale, MetricCategory, MarketMetric, NavSection, NavGroup, Strategy, ScreenerResult, BacktestMode, OrderType, BacktestParams, TimeSeriesPoint, MonthlyReturn, BacktestResult, MetricTile, ChartTab, RegimeBreakdown, TradeDirection, TradeRecord, RegimeStatus, MarketRegime, SentimentEventType, Sentiment, SentimentEvent, ConfidenceLevel, FlagSeverity, PlanImpact, RiskFlag, AIReview, ResourceUsage, ChatMessage, UsageMetric, MetricEditPayload, FunctionGatewayCard, and all six molecule prop interfaces (MetricTileProps, RegimeCardProps, NavItemProps, FunctionGatewayCardProps, RiskFlagItemProps, ScreenerResultRowProps)
- [ ] T008 [P] Create `src/lib/data/market.ts` — export `sampleMarketMetrics: MarketMetric[]` (8 tiles: S&P 500, Nasdaq, Hang Seng, VIX, 10Y Yield, Strategies Saved, Backtest Queue, Active Alerts — with realistic sample values and delta/deltaPositive), `sampleMarketRegimes: MarketRegime[]` (7 regimes: Bull Trend [active], Bear Trend [inactive], High Volatility [warning], Low Volatility [inactive], Risk-On [active], Risk-Off [inactive], Inflation Shock [inactive] — each with logicDescription and 2–3 indicators), `sampleScreenerResults: ScreenerResult[]` (10+ rows with varied PE/EV/ROIC/growth values and computed score)
- [ ] T009 [P] Create `src/lib/data/performance.ts` — export `sampleBacktestResult: BacktestResult` (equityCurve: 48 monthly TimeSeriesPoint entries starting Jan 2020, drawdownSeries: matching array with negative values, monthlyReturns: 12 MonthlyReturn entries for heatmap, benchmarkSeries: SPY benchmark), `defaultMetricTiles: MetricTile[]` (8 tiles: Total Return "42.8%" order 0, Net Profit "$42,800" order 1, Max Drawdown "-18.2%" order 2, Sharpe Ratio "1.84" order 3, Win Rate "58.3%" order 4, Profit Factor "1.92" order 5, Volatility "14.6%" order 6, Exposure Time "73.2%" order 7), `sampleRegimeBreakdown: RegimeBreakdown[]` (4 rows: Bull Trend / Bear Trend / High Volatility / Low Volatility), `samplePerfSummary: { label: string; value: string }[]` (full stats table: 15+ rows of standard backtest statistics)
- [ ] T010 [P] Create `src/lib/data/trades.ts` — export `sampleTrades: TradeRecord[]` (18 records: mixed Long/Short direction, realistic AAPL/MSFT/NVDA/GOOGL/META symbols, dates ranging 2023-01-01 to 2024-12-31, varied exitReason values: "Stop Loss", "Target Hit", "Signal", "Trailing Stop", "End of Period")
- [ ] T011 [P] Create `src/lib/data/sentiment.ts` — export `sampleSentimentEvents: SentimentEvent[]` (12 events covering all 6 type categories: 3 news, 2 earnings, 1 fed, 2 macro, 2 insider, 2 social — with realistic headlines, dates, and sentiment scores)
- [ ] T012 [P] Create `src/lib/data/strategy.ts` — export `sampleStrategy: Strategy` (realistic market/filter/period/positionSize/riskRule values), `sampleAIReview: AIReview` (grade: "B+", confidence: "medium", riskFlags: 3 items — Overfitting Risk [medium], Regime Dependency [medium], Survivorship Bias [low]), `sampleResourceUsage: ResourceUsage` (tokensUsed: 4250, tokensTotal: 10000, backtestsUsed: 3, backtestsTotal: 10, queuePosition: 0, estimatedRuntime: "~42s", complexityScore: 67, planImpact: "medium")
- [ ] T013 Create `src/lib/state/app.svelte.ts` — export two module-level reactive variables using Svelte 5 `$state`: `export let activeSection = $state<SectionId>('dashboard')` and `export let currentLocale = $state<Locale>('en')`; add a shared `strategyInputText` `$state<string>('')` for Dashboard→StrategyBuilder pre-fill; add `backtestPrefillSymbol` `$state<string>('')` for FundamentalScreener→BacktestEngine pre-fill
- [ ] T014 Update `src/routes/+layout.svelte` — replace current content: import Toaster from `$lib/components/ui/sonner/toaster.svelte`; render `{@render children()}` (preserve existing favicon svelte:head); add `<Toaster />` at root level; keep existing locale-aware anchor list (already present for SEO)
- [ ] T015 Update `messages/en.json` — add skeleton navigation and shell message keys: section labels (dashboard, ai_strategy_builder, fundamental_screener, technical_screener, backtest_engine, performance_result, market_regime, sentiment_events, trade_log, settings_billing), nav group labels (nav_group_main, nav_group_result), top bar labels (search_placeholder, save, export_json, send_to_ai, language_en, language_zh_tw); populate matching keys in `messages/zh-TW.json` with Traditional Chinese translations; run `pnpm dev` once to regenerate `src/lib/paraglide/` runtime including zh-TW support

**Checkpoint**: Foundation ready — TypeScript types, mock data, global state, and layout shell in place; user story implementation can begin

---

## Phase 3: User Story 1 — View Investment Research Dashboard (Priority: P1) 🎯 MVP

**Goal**: Dashboard with market metric grid, AI Research Box with validation, and function gateway cards visible on page load

**Independent Test**: Open localhost:5173 → Investment Research Workbench dashboard is the default view → 8+ metric tiles visible with market/risk/rates/usage categories → AI Research Box textarea is present → 6+ function gateway cards visible → clicking "Convert to Strategy" with text pre-filled sets activeSection to 'strategy-builder'

- [ ] T016 [P] [US1] Create `src/lib/components/molecules/MetricTile.svelte` — accepts `tile: MetricTile` prop via `$props()`; renders shadcn-svelte Card with label, value, unit, and delta text; applies `text-green-400` when `tile.deltaPositive` is true, `text-red-400` when false; does NOT include draggable or edit props yet (those are added in T034 for US4); no internal `$state`
- [ ] T017 [P] [US1] Create `src/lib/components/molecules/FunctionGatewayCard.svelte` — accepts `card: FunctionGatewayCard` and `onClick: () => void` via `$props()`; renders shadcn-svelte Card with icon placeholder, title (from card.titleKey resolved via m.*), description (from card.descriptionKey via m.*); fires onClick on click; no internal state
- [ ] T018 [US1] Create `src/lib/components/organisms/DashboardSection.svelte` — $state for AI Research Box textarea text and validation error; metric grid: 8 MetricTile molecules from sampleMarketMetrics in a responsive grid div; AI Research Box panel: shadcn-svelte Textarea + "Convert to Strategy" Button (empty text → set $state validationError = true + show red border; non-empty → set strategyInputText in app.svelte.ts + set activeSection='strategy-builder'); quick-action chip row (Button chips for New Strategy, New Backtest, Screener, Backtest, Report — each sets activeSection to appropriate SectionId); function gateway list: 6+ FunctionGatewayCard molecules with onClick setting activeSection; add dashboard message keys (dashboard_title, ai_research_box_placeholder, convert_to_strategy, quick_action_*, gateway_card_* etc.) to messages/en.json and messages/zh-TW.json
- [ ] T019 [US1] Create placeholder `src/lib/components/organisms/StrategyBuilderSection.svelte` — minimal organism showing "AI Strategy Builder" heading and a div that displays `strategyInputText` from app.svelte.ts (so the pre-fill from Dashboard is visually confirmable); exports empty `reset()` method and `getStrategyConfig()` returning null; this file is fully replaced in T029
- [ ] T020 [US1] Update `src/routes/+page.svelte` — replace "Welcome to SvelteKit" placeholder: import activeSection from `$lib/state/app.svelte.ts`; import DashboardSection and StrategyBuilderSection; render each inside `<div style:display={activeSection === 'id' ? 'block' : 'none'}>` wrappers (NO {#if} blocks); add TopBar placeholder div above sections; verify page renders with Dashboard visible by default

**Checkpoint — US1**: `pnpm dev` → localhost:5173 shows dashboard with 8+ metric tiles, AI Research Box, 6+ gateway cards; "Convert to Strategy" (with text) shows StrategyBuilderSection placeholder

---

## Phase 4: User Story 2 — Navigate Between Research Sections (Priority: P2)

**Goal**: Full three-column shell — working navigation sidebar, top bar with language switcher, all 10 sections reachable, section state preserved across navigation

**Independent Test**: Click all 10 navigation items → correct section shows, others hidden, active item highlighted → reload → Dashboard is default → type text in Strategy Builder → navigate away → navigate back → text is preserved

- [ ] T021 [P] [US2] Create `src/lib/components/molecules/NavItem.svelte` — accepts NavItemProps (section: NavSection, isActive: boolean, onClick: () => void) via `$props()`; renders a Button or anchor with icon slot, label (from m.[section.labelKey]()), and active state styling (highlighted bg/text when isActive); no internal state
- [ ] T022 [US2] Create `src/lib/components/organisms/NavigationSidebar.svelte` — brand header div with logo SVG + platform name text; LEVEL 1 / MAIN section (m.nav_group_main() label + 5 NavItem molecules for: Dashboard, AI Strategy Builder, Fundamental Screener, Technical Screener, Backtest Engine); LEVEL 2 / RESULT section (m.nav_group_result() label + 5 NavItems for: Performance Result, Market Regime, Sentiment & Events, Trade Log, Settings/Billing); live controls section with $state for totalReturn/maxDrawdown/winRate string inputs (shadcn-svelte Input), "Simulate Re-run" Button (stores values in a $state object exported from this organism for PerformanceResultSection to read; calls `toast.success("Simulated re-run applied")`); NavItem onClick: sets activeSection in app.svelte.ts; isActive: computed from activeSection === section.id; add nav sidebar string keys to messages/en.json and messages/zh-TW.json
- [ ] T023 [US2] Create `src/lib/components/organisms/TopBar.svelte` — non-functional global search Input with placeholder text; language switcher Button (label shows current locale EN/中文; onclick: toggle currentLocale and call `overrideLocale(newLocale)` from `$lib/paraglide/runtime`); Save Button: `toast.success(m.save_success())`; Export JSON Button: call getStrategyConfig() via a context-provided function, create JSON Blob, trigger `<a>` download; Send to AI Button: set activeSection='strategy-builder'; add top bar string keys to messages/en.json and messages/zh-TW.json
- [ ] T024 [P] [US2] Create stub organism files for all 8 remaining sections in `src/lib/components/organisms/` — each file renders a section wrapper div with a heading showing the section name and a "Content coming soon" placeholder; files: FundamentalScreenerSection.svelte, TechnicalScreenerSection.svelte, BacktestEngineSection.svelte (stub also exports empty `reset()` and accepts `prefillSymbol?: string` prop), PerformanceResultSection.svelte, MarketRegimeSection.svelte, SentimentEventsSection.svelte, TradeLogSection.svelte, SettingsBillingSection.svelte
- [ ] T025 [US2] Create stub `src/lib/components/organisms/AIReviewSidebar.svelte` — renders right sidebar column with 4 placeholder panel divs (AI Review, Resource & Cost, AI Chat, Quick Actions); fully implemented in T042
- [ ] T026 [US2] Update `src/routes/+layout.svelte` — replace layout with three-column CSS grid (grid-cols with fixed left ~240px, flex-1 center, fixed right ~280px; min-width 1280px; dark bg; overflow hidden on root); import and mount NavigationSidebar in left column; keep `{@render children()}` for center column; import and mount AIReviewSidebar in right column; Toaster remains at root
- [ ] T027 [US2] Update `src/routes/+page.svelte` — import all 10 section organisms; mount each in display-controlled wrapper `<div style:display={activeSection === id ? 'block' : 'none'}>` (10 wrappers, NO {#if} blocks); TopBar above section wrappers; `bind:this={strategyBuilderRef}` on StrategyBuilderSection; `bind:this={backtestRef}` on BacktestEngineSection (for reset calls in US5); add section entry via Svelte setContext to expose getStrategyConfig for TopBar Export JSON
- [ ] T028 [US2] Verify state preservation and section transitions — confirm no {#if} blocks used for section visibility in +page.svelte; open Strategy Builder → type text → navigate to Dashboard → navigate back → confirm text persists; navigate between all 10 sections and confirm no page reload occurs; add fade-in CSS animation class placeholder on active section wrappers

**Checkpoint — US2**: All 10 nav items work → Dashboard is default → active nav item highlighted → state persists on navigate-back → transitions immediate

---

## Phase 5: User Story 3 — AI Strategy Builder Input (Priority: P3)

**Goal**: NL strategy text parsed into structured output; navigation to Backtest Engine, Fundamental Screener, Technical Screener; Fundamental Screener per-row Backtest pre-fills BacktestEngine

**Independent Test**: Navigate to AI Strategy Builder → enter text → "Parse Strategy" → structured 6-row table visible → "Send to Backtest" navigates to Backtest Engine → "Open Fundamental Screener" navigates and shows screener table → per-row Backtest pre-fills BacktestEngine universe field

- [ ] T029 [US3] Implement full `src/lib/components/organisms/StrategyBuilderSection.svelte` (replaces T019 placeholder) — $state for NL textarea text (initialized from app.svelte.ts strategyInputText); $state for parsedStrategy (null initially); Parse Strategy Button: sets parsedStrategy = sampleStrategy (mock parse — no AI call); Send to Backtest Button: sets activeSection='backtest-engine'; Open Fundamental Screener Button: sets activeSection='fundamental-screener'; Open Technical Screener Button: sets activeSection='technical-screener'; structured strategy output panel: shadcn-svelte Table with 6 rows (Market / Fundamental Filter / Technical Filter / Backtest Period / Position Size / Risk Rule) shown only when parsedStrategy is non-null; exports `getStrategyConfig(): Strategy` returning parsedStrategy or a default blank Strategy; exports `reset()` clearing textarea text and parsedStrategy; add strategy builder string keys (parse_strategy, send_to_backtest, open_fundamental_screener, open_technical_screener, strategy_output_*, etc.) to messages/en.json and messages/zh-TW.json
- [ ] T030 [US3] Implement `src/lib/components/organisms/BacktestEngineSection.svelte` (replaces T024 stub) — $state for all params (mode: BacktestMode, initialCapital: string, startDate/endDate: string, market/universe/timeframe: string, commissionModel/slippageModel: string, positionSize/stopLoss/takeProfit: string, direction: 'Long'|'Short'|'Both', rebalanceFrequency: string, selectedOrderTypes: Set<OrderType>); shadcn-svelte Select for mode (6 BacktestMode options) and direction; shadcn-svelte Input for numeric params; 8 OrderType checkboxes; Run Backtest Button: calls `toast.info(m.backtest_queued())`; exports `reset()` restoring all params to defaults; `$effect(() => { if (backtestPrefillSymbol) { universe = backtestPrefillSymbol; } })` to respond to prefill from app.svelte.ts; add backtest engine string keys to messages/en.json and messages/zh-TW.json
- [ ] T031 [P] [US3] Create `src/lib/components/molecules/ScreenerResultRow.svelte` — accepts ScreenerResultRowProps (result: ScreenerResult, onBacktest: (symbol: string) => void) via `$props()`; renders one shadcn-svelte Table row with 9 data cells (symbol, name, PE, EV/EBITDA, FCF Yield, ROIC, rev growth, EPS growth, score) and a "Backtest" Button cell; onBacktest(result.symbol) called on button click; no internal state
- [ ] T032 [US3] Implement `src/lib/components/organisms/FundamentalScreenerSection.svelte` (replaces T024 stub) — filter controls: universe shadcn-svelte Select + 6 numeric filter Inputs (PE ≤, EV/EBITDA ≤, FCF Yield ≥, ROIC ≥, Revenue CAGR ≥, EPS Growth ≥) with $state; factor ranking weight table (shadcn-svelte Table with 5 factor rows and weight Input per row); screener results: shadcn-svelte Table using ScreenerResultRow molecules from sampleScreenerResults; per-row Backtest action: set backtestPrefillSymbol in app.svelte.ts + set activeSection='backtest-engine'; add fundamental screener string keys to messages/en.json and messages/zh-TW.json
- [ ] T033 [US3] Implement `src/lib/components/organisms/TechnicalScreenerSection.svelte` (replaces T024 stub) — $state for 4 indicator dropdowns (trend, momentum, volatility, volume) using shadcn-svelte Select; $state for selected pattern chips (Set<string>); 8 pattern chip toggles (shadcn-svelte Badge/Button with active styling: Head & Shoulders, Double Top, Bull Flag, Cup & Handle, Triangle, Wedge, MACD Cross, RSI Oversold); pattern explanation display: conditional text block showing description for selected pattern(s); LayerChart chart preview: `<Chart>` with `<Spline>` using a sample 60-point price time series; Tooltip on hover; add technical screener string keys to messages/en.json and messages/zh-TW.json

**Checkpoint — US3**: Strategy Builder → Parse Strategy → 6-row structured table → "Send to Backtest" navigates → Fundamental Screener per-row Backtest pre-fills BacktestEngine → Technical Screener shows LayerChart preview

---

## Phase 6: User Story 4 — View Backtest Performance Results (Priority: P4)

**Goal**: Performance results board with 8 draggable/editable metric tiles, LayerChart chart tabs, regime breakdown table, long/short split, Trade Log with 14 columns

**Independent Test**: Navigate to Performance Result → 8 metric tiles visible → drag tile 1 onto tile 3 → order changes → double-click tile → edit modal opens → enter "abc" → error state, Apply disabled → enter "55.2" → Apply updates tile → click "Drawdown" chart tab → chart switches → Trade Log shows 14 columns with 15+ sample rows

- [ ] T034 [P] [US4] Update `src/lib/components/molecules/MetricTile.svelte` (extends T016) — add optional props: `draggable?: boolean`, `onDragStart?: (e: DragEvent) => void`, `onDragOver?: (e: DragEvent) => void`, `onDrop?: (e: DragEvent) => void`, `onDoubleClick?: (tile: MetricTile) => void`; when draggable is true, add `draggable="true"` attribute and wire event handlers; backwards compatible — dashboard usage (T016) passes no drag/edit props
- [ ] T035 [US4] Implement `src/lib/components/organisms/PerformanceResultSection.svelte` (replaces T024 stub) — $state for tiles array (initialized from defaultMetricTiles), draggedIndex ($state<number|null>), activeChartTab ($state<ChartTab>('equity-curve')); draggable metric tile grid: 8 MetricTile molecules with drag event handlers (ondragstart: set draggedIndex; ondragover: preventDefault; ondrop: splice/insert reorder array + clear draggedIndex); shadcn-svelte Tabs component with 4 ChartTab values; Equity Curve tab: `<Chart><Spline data={sampleBacktestResult.equityCurve} /></Chart>` with Axis and Tooltip; Drawdown tab: `<Chart><Area data={sampleBacktestResult.drawdownSeries} /></Chart>`; Benchmark Overlay tab: two Splines on same Chart; Monthly Heatmap tab: `<Chart><Bars data={sampleBacktestResult.monthlyReturns} /></Chart>`; all charts with hover Tooltip; regime breakdown shadcn-svelte Table (4 columns: Regime, Return, Max DD, Win Rate, Trades) from sampleRegimeBreakdown; long/short split table (2 rows × 5 metrics); full performance summary Table from samplePerfSummary; empty-state: when tiles is empty show placeholder + Button to navigate to Backtest Engine; add performance result string keys to messages/en.json and messages/zh-TW.json
- [ ] T036 [US4] Add edit metric modal to `PerformanceResultSection.svelte` — $state for modalOpen (boolean), editingTileId (string|null), editValue (string), editError (string|null); shadcn-svelte Dialog opened when MetricTile onDoubleClick fires; Dialog contains Input bound to editValue; $derived isValid: `!isNaN(parseFloat(editValue)) && editValue.trim() !== ''`; error message shown when editValue is non-empty and !isValid; Apply Button disabled when !isValid; Apply: find tile by editingTileId in tiles array, update value field, close Dialog; Cancel: close Dialog (FR-019)
- [ ] T037 [US4] Wire Simulate Re-run to Performance Result — in NavigationSidebar.svelte (T022): on Simulate Re-run click, export the three live control values via a Svelte 5 `$state` object in app.svelte.ts (simulatedMetrics: {totalReturn, maxDrawdown, winRate}); in PerformanceResultSection.svelte: use `$effect` to watch simulatedMetrics, update corresponding tiles (Total Return, Max Drawdown, Win Rate) when simulatedMetrics changes (FR-002)
- [ ] T038 [US4] Implement `src/lib/components/organisms/TradeLogSection.svelte` (replaces T024 stub) — $state for trades (initialized from sampleTrades); shadcn-svelte Table with 14 columns in this order: Trade ID, Symbol, Long/Short, Entry Date, Entry Price, Exit Date, Exit Price, Quantity, Commission, Slippage, Net PnL, Return %, Holding Days, Exit Reason; scrollable table container (overflow-x: auto); empty-state: when trades is empty show placeholder + Button to navigate to Backtest Engine; verify no column truncation at 1280px viewport; add trade log string keys to messages/en.json and messages/zh-TW.json
- [ ] T039 [US4] Add Export CSV functionality — in `src/lib/data/trades.ts` add `tradesToCsv(trades: TradeRecord[]): string` helper that serializes trades to CSV with 14-column header row; in `AIReviewSidebar.svelte` (stub from T025) expose Export CSV Button that calls tradesToCsv(sampleTrades), creates Blob, triggers download as `trade-log.csv`; this partial AIReviewSidebar update prepares for full implementation in T042
- [ ] T040 [US4] Verify empty-state branches — temporarily replace sampleTrades export with empty array and samplePerfSummary with empty array; confirm PerformanceResultSection shows "No backtest results yet" placeholder + "Run Backtest" CTA button; confirm TradeLogSection shows placeholder + CTA; restore mock data after verification (FR-021)

**Checkpoint — US4**: Performance Result → metric tiles → drag reorders → double-click → edit modal → non-numeric error → valid number applies → chart tab switches → Trade Log shows 14 columns with 15+ sample rows

---

## Phase 7: User Story 5 — Use Right-Sidebar AI Tools (Priority: P5)

**Goal**: Persistent right sidebar visible on all sections — AI Review pre-populated (B+ grade, 3 risk flags), Resource & Cost metrics, AI Chat with mock response, Quick Actions with navigation and reset shortcuts

**Independent Test**: Switch to any of the 10 sections → right sidebar always visible with all 4 panels → AI Review shows B+ grade, medium confidence, 3 risk flags → Resource & Cost shows 6 metrics → type question + Send → message and placeholder AI response appear in chat → "New Strategy" resets Strategy Builder state and navigates → "New Backtest" resets BacktestEngine params and navigates

- [ ] T041 [P] [US5] Create `src/lib/components/molecules/RegimeCard.svelte` — accepts RegimeCardProps (regime: MarketRegime) via `$props()`; renders shadcn-svelte Card with: colored status dot (Tailwind: active=bg-green-500, warning=bg-yellow-500, inactive=bg-gray-500), regime name heading, logicDescription text, indicator list as shadcn-svelte Badge chips; no internal state
- [ ] T042 [P] [US5] Create `src/lib/components/molecules/RiskFlagItem.svelte` — accepts RiskFlagItemProps (flag: RiskFlag) via `$props()`; renders a row with colored dot (high=red-500, medium=yellow-500, low=green-500), flag.label in bold, flag.description in muted text; no internal state
- [ ] T043 [US5] Implement full `src/lib/components/organisms/AIReviewSidebar.svelte` (replaces T025 stub):
  **AI Review panel**: renders sampleAIReview.grade as large badge, confidence level badge, sampleAIReview.riskFlags as RiskFlagItem molecules; always pre-populated (FR-018)
  **Resource & Cost panel**: renders sampleResourceUsage metrics — tokensUsed/tokensTotal with shadcn-svelte Progress, backtestsUsed/backtestsTotal with Progress, queuePosition, estimatedRuntime, complexityScore, planImpact
  **AI Chat panel**: $state messages (ChatMessage[], starts empty); shadcn-svelte Textarea for input + $state chatInput; "Send Message to AI" Button: appends {role:'user', content: chatInput} + appends {role:'assistant', content: m.ai_chat_placeholder_response()} to messages; clears chatInput; scrollable message list
  **Quick Actions panel**: New Strategy Button: call strategyBuilderRef.reset() via context + set activeSection='strategy-builder' + toast; New Backtest Button: call backtestRef.reset() + set activeSection='backtest-engine' + toast; Fundamental Button: set activeSection='fundamental-screener'; Technical Button: set activeSection='technical-screener'; Report Button: set activeSection='performance-result'; Regime Button: set activeSection='market-regime'; Export CSV Button: reuse tradesToCsv from T039; Export PDF Button: toast.info(m.pdf_export_coming_soon())
  add all AI sidebar string keys to messages/en.json and messages/zh-TW.json
- [ ] T044 [US5] Wire Quick Actions reset calls in `src/routes/+page.svelte` — expose strategyBuilderRef and backtestRef to AIReviewSidebar via Svelte `setContext`/`getContext` (context key 'organism-refs'); AIReviewSidebar reads context to call reset() on Quick Actions; confirm "New Strategy" clears StrategyBuilderSection $state and "New Backtest" clears BacktestEngineSection $state (FR-005 exception)
- [ ] T045 [US5] Implement `src/lib/components/organisms/MarketRegimeSection.svelte` (replaces T024 stub) — renders 7+ RegimeCard molecules from sampleMarketRegimes in a grid; AI-generated regime summary text block (static sample text from sampleMarketRegimes[0].aiSummary or a separate string); add market regime string keys to messages/en.json and messages/zh-TW.json
- [ ] T046 [US5] Implement `src/lib/components/organisms/SentimentEventsSection.svelte` (replaces T024 stub) — shadcn-svelte Table with 8 columns (Type, Symbol, Date, Headline, Sentiment, Score, earnings surprise, analyst revision — adapt from SentimentEvent type) from sampleSentimentEvents; sentiment column shows colored Badge (positive=green, negative=red, neutral=gray); add sentiment string keys to messages/en.json and messages/zh-TW.json
- [ ] T047 [US5] Implement `src/lib/components/organisms/SettingsBillingSection.svelte` (replaces T024 stub) — 4 usage metric tiles (Tokens Used Today: tokensUsed/tokensTotal, Backtests Used: backtestsUsed/backtestsTotal, Queue Position: queuePosition, Complexity Score: complexityScore) from sampleResourceUsage displayed using shadcn-svelte Card; add settings/billing string keys to messages/en.json and messages/zh-TW.json

**Checkpoint — US5**: Right sidebar visible on all 10 sections → AI Review pre-populated → Resource & Cost shows 6 metrics → chat works → "New Strategy" resets + navigates → Quick Actions all navigate correctly

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Animation, layout validation, type safety, i18n completeness, Storybook stories, code quality

- [ ] T048 [P] Add section entrance animation in `src/routes/+page.svelte` — add Tailwind `animate-in fade-in duration-150` class to each section wrapper div; verify total perceived section switch time well below 300ms SC-002 threshold
- [ ] T049 [P] Viewport layout validation — open localhost:5173 in browser at exactly 1280px width; verify three-column layout renders without overflow or clipping for all 10 sections; verify no horizontal scrollbar at 1280px on any section; set browser to 1000px width and confirm horizontal scroll (not reflow) occurs; verify Trade Log 14 columns visible without truncation at 1280px (SC-003, SC-006, SC-007, narrow-viewport edge case)
- [ ] T050 Verify 2-click navigation rule (SC-001) — from each of the 10 sections, confirm all other 9 sections are reachable in at most 2 clicks using the navigation sidebar; confirm Quick Actions in AI sidebar provide 1-click shortcuts to primary sections
- [ ] T051 [P] Create Storybook component stories in `src/stories/` — MetricTile.stories.svelte (default + draggable + with edit props), NavItem.stories.svelte (active + inactive), FunctionGatewayCard.stories.svelte, RegimeCard.stories.svelte (active + warning + inactive), RiskFlagItem.stories.svelte (high + medium + low severity), ScreenerResultRow.stories.svelte; run `pnpm storybook` to verify all render correctly
- [ ] T052 [P] TypeScript validation — run `pnpm check`; fix all TypeScript and Svelte type errors revealed by svelte-check; ensure no `any` types remain in organism or molecule files
- [ ] T053 [P] Code quality — run `pnpm lint` and `pnpm format`; fix all ESLint warnings and Prettier formatting issues across all new files in `src/lib/components/` and `src/lib/data/`
- [ ] T054 Final i18n audit — switch language to 中文 (zh-TW) in the running app; visually verify all 10 sections display Traditional Chinese strings; identify and replace any remaining hardcoded English strings with `m.*` calls; ensure messages/zh-TW.json has no missing keys (SC-008, FR-023)
- [ ] T055 [P] Quickstart validation — follow `specs/001-home-page-svelte/quickstart.md` steps on a clean checkout; verify all commands run without errors; update quickstart.md if any step is incorrect or outdated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T001 must complete before T002
- **Foundational (Phase 2)**: Depends on Setup completion; T007 needed before T008–T012 (mock data imports types); T013–T015 can start after T007; T014 needs T002 (shadcn-svelte Sonner)
- **User Stories (Phase 3–7)**: ALL depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other user stories — delivers standalone value (dashboard view)
- **US2 (P2)**: Depends on US1 stubs/organisms being created; wraps all organisms in full 3-column shell; independently testable (navigation verification)
- **US3 (P3)**: Depends on US2 (full navigation shell) for navigation actions to work end-to-end; independently testable on Strategy Builder section alone
- **US4 (P4)**: Depends on US2 (full shell); Simulate Re-run connects NavigationSidebar (US2) to PerformanceResult (US4); independently testable on Performance Result and Trade Log sections
- **US5 (P5)**: Depends on US2 (shell), US3 (StrategyBuilderSection reset), US4 (BacktestEngineSection reset, TradeLog Export CSV); completes the full feature

### Within Each User Story

- Molecules before organisms (molecules are used by organisms)
- Stubs before full implementations (stubs allow navigation to work even before full content)
- Data modules (Phase 2) before organisms (organisms consume mock data)

### Parallel Opportunities

- All [P] tasks within a phase can run simultaneously
- Phase 2: T008–T012 (all 5 mock data modules) fully parallel
- Phase 3: T016+T017 parallel (independent molecules)
- Phase 4: T021+T024 parallel (NavItem molecule + section stubs)
- Phase 7: T041+T042 parallel (RegimeCard + RiskFlagItem molecules)
- Polish: T048+T049+T051+T052+T053+T055 all parallel

---

## Parallel Example: User Story 1

```bash
# Launch all Phase 3 parallelizable tasks together:
Task T016: "Create MetricTile.svelte in src/lib/components/molecules/"
Task T017: "Create FunctionGatewayCard.svelte in src/lib/components/molecules/"

# Then sequentially (T018 depends on T016+T017):
Task T018: "Create DashboardSection.svelte in src/lib/components/organisms/"
Task T019: "Create StrategyBuilderSection.svelte placeholder"
Task T020: "Update src/routes/+page.svelte with section visibility"
```

## Parallel Example: Foundational Phase

```bash
# After T007 completes, launch all mock data modules together:
Task T008: "Create src/lib/data/market.ts"
Task T009: "Create src/lib/data/performance.ts"
Task T010: "Create src/lib/data/trades.ts"
Task T011: "Create src/lib/data/sentiment.ts"
Task T012: "Create src/lib/data/strategy.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Dashboard)
4. **STOP and VALIDATE**: Open localhost:5173, verify 8+ metric tiles, AI Research Box, 6+ gateway cards
5. Demo if ready

### Incremental Delivery

1. Phase 1+2: Foundation → types, mock data, global state, layout
2. Phase 3: US1 → Dashboard loads, metric grid visible (MVP)
3. Phase 4: US2 → Full navigation, all sections reachable
4. Phase 5: US3 → Strategy Builder parses text, Screeners implemented
5. Phase 6: US4 → Performance Result with charts, Trade Log
6. Phase 7: US5 → AI Sidebar with Quick Actions, remaining section implementations
7. Polish: Animation, i18n audit, type safety, Storybook

### Solo Developer Path (Sequential)

Execute phases in order, validate each checkpoint before proceeding. Leverage parallel tasks within each phase to reduce total time. Estimated task count per phase:

| Phase | Tasks | Parallelizable |
|-------|-------|---------------|
| Phase 1: Setup | 6 | 2 |
| Phase 2: Foundational | 9 | 5 |
| Phase 3: US1 Dashboard | 5 | 2 |
| Phase 4: US2 Navigation | 8 | 2 |
| Phase 5: US3 Strategy Builder | 5 | 1 |
| Phase 6: US4 Performance | 7 | 1 |
| Phase 7: US5 AI Sidebar | 7 | 2 |
| Polish | 8 | 6 |
| **Total** | **55** | **21** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in the same phase
- [Story] label maps task to user story for traceability
- Each user story is independently completable and testable via its checkpoint
- No TDD required by spec — Storybook stories provide visual/interaction validation
- Commit after each task group or at each checkpoint
- Stop at any checkpoint to validate before continuing
- Avoid: vague file paths, same-file conflicts across parallel tasks, {#if} blocks for section visibility
- Key spec constraints always in scope: dark mode only (FR-020), Atomic Design (FR-022), no {#if} for sections (research Decision 6), Paraglide for all strings (FR-023)
