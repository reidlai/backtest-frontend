# Tasks: Zod Schema per Organism

**Input**: Design documents from `specs/005-zod-schema-organisms/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependency and verify BDD feature file is in place (Constitution Rule 6: BDD tasks precede implementation)

- [x] T001 Add `zod` as a runtime dependency in `package.json` by running `pnpm add zod`
- [x] T002 [BDD] Verify `features/zod-schema-organisms.feature` exists with `@smoke` and `@integration` tagged scenarios (created in plan phase — confirm tags match constitution Rule 6 requirements)
- [x] T002a [BDD] Create `features/step-definitions/zod-schema-organisms.ts` — implement step definitions for all 7 scenarios in `zod-schema-organisms.feature` (Background, file-count, parse-defaults, TypeScript check, enum validation, state consolidation, global-state-guard, barrel-export); steps MUST be atomic, reusable, and contain no business logic (Constitution Rule 6)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the `src/lib/schemas/` module skeleton that all schema files will populate

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create `src/lib/schemas/index.ts` as an empty barrel file (comment-only placeholder; will be populated in Phase 3 and Phase 4)

**Checkpoint**: `src/lib/schemas/` directory and `index.ts` exist — organism schema tasks can now begin

---

## Phase 3: User Story 1 — Organism State via Zod Schema (Priority: P1) 🎯 MVP

**Goal**: The 4 organisms with local `$state` each get a Zod schema, and their components consolidate all state variables into a single `let state = $state(Schema.parse({}))` object.

**Independent Test**: Run `pnpm check` — TypeScript reports zero errors. In a browser or Vitest, confirm `AIChatPanelSchema.parse({})` returns `{ chatInput: '', messages: [] }`, `AIResearchBoxSchema.parse({})` returns `{ aiText: '', validationError: false }`, and both `PerformancdeChartTabs` and `PerformanceMetricGrid` components initialize without errors.

### Schema Creation (run in parallel — independent files)

- [x] T004 [P] [US1] [ZOD] Create `src/lib/schemas/ai-chat-panel.schema.ts` — export `AIChatPanelSchema` with `chatInput: z.string().default('')` and `messages: z.custom<ChatMessage[]>().default([])`; export `AIChatPanelState = z.infer<typeof AIChatPanelSchema>`
- [x] T005 [P] [US1] [ZOD] Create `src/lib/schemas/ai-research-box.schema.ts` — export `AIResearchBoxSchema` with `aiText: z.string().default('')` and `validationError: z.boolean().default(false)`; export `AIResearchBoxState`
- [x] T006 [P] [US1] [ZOD] Create `src/lib/schemas/performance-chart-tabs.schema.ts` — export `PerformanceChartTabsSchema` with `activeChartTab: z.enum(['equity-curve', 'drawdown', 'benchmark-overlay', 'monthly-heatmap']).default('equity-curve')`; export `PerformanceChartTabsState` (note: file uses corrected spelling; organism file typo `PerformancdeChartTabs` is unchanged)
- [x] T007 [P] [US1] [ZOD] Create `src/lib/schemas/performance-metric-grid.schema.ts` — export `PerformanceMetricGridSchema` with `tiles: z.custom<MetricTile[]>().default([])`, `draggedIndex: z.number().nullable().default(null)`, `editingTileId: z.string().nullable().default(null)`, `editValue: z.string().default('')`, `modalOpen: z.boolean().default(false)`; export `PerformanceMetricGridState`

### Component Updates (run in parallel after their schema is created)

- [x] T008 [P] [US1] Update `src/lib/components/organisms/AIChatPanel.svelte` — replace `let chatInput = $state('')` and `let messages = $state<ChatMessage[]>([])` with `import { AIChatPanelSchema } from '$lib/schemas'; let state = $state(AIChatPanelSchema.parse({}));`; update all template and handler references from `chatInput`/`messages` to `state.chatInput`/`state.messages`
- [x] T009 [P] [US1] Update `src/lib/components/organisms/AIResearchBox.svelte` — replace `let aiText = $state('')` and `let validationError = $state(false)` with `import { AIResearchBoxSchema } from '$lib/schemas'; let state = $state(AIResearchBoxSchema.parse({}));`; update all references to `state.aiText`/`state.validationError`
- [x] T010 [P] [US1] Update `src/lib/components/organisms/PerformancdeChartTabs.svelte` — replace `let activeChartTab = $state<ChartTab>('equity-curve')` with `import { PerformanceChartTabsSchema } from '$lib/schemas'; let state = $state(PerformanceChartTabsSchema.parse({}));`; update all template references from `activeChartTab` to `state.activeChartTab`
- [x] T011 [US1] Update `src/lib/components/organisms/PerformanceMetricGrid.svelte` — replace all 5 individual `$state` declarations (`tiles`, `draggedIndex`, `editingTileId`, `editValue`, `modalOpen`) with `import { PerformanceMetricGridSchema } from '$lib/schemas'; let state = $state(PerformanceMetricGridSchema.parse({})); state.tiles = [...defaultMetricTiles];`; update all template and handler references (e.g., `tiles` → `state.tiles`, `draggedIndex = index` → `state.draggedIndex = index`); use direct property assignment for all mutations

### Barrel Update

- [x] T012 [US1] Update `src/lib/schemas/index.ts` to export US1 schemas: `ai-chat-panel`, `ai-research-box`, `performance-chart-tabs`, `performance-metric-grid`

**Checkpoint**: US1 complete — 4 schemas created, 4 components updated, `pnpm check` passes, organisms render correctly

---

## Phase 4: User Story 2 — Schema Files for All Organisms (Priority: P2)

**Goal**: All 12 remaining organisms receive schema files, ensuring full coverage across the atomic design system. The index.ts barrel exports all 16 schemas.

**Independent Test**: Count files in `src/lib/schemas/` — expect exactly 17 files (16 `.schema.ts` + 1 `index.ts`). Run `pnpm check` — zero errors. Verify `NavigationSidebarSchema.parse({})` returns `{}`.

### Empty Schemas — organisms with no local state (run in parallel)

- [x] T013 [P] [US2] [ZOD] Create `src/lib/schemas/ai-review-panel.schema.ts` — export `AIReviewPanelSchema = z.object({})` and `AIReviewPanelState`
- [x] T014 [P] [US2] [ZOD] Create `src/lib/schemas/ai-review-sidebar.schema.ts` — export `AIReviewSidebarSchema = z.object({})` and `AIReviewSidebarState`
- [x] T016 [P] [US2] [ZOD] Create `src/lib/schemas/live-control-form.schema.ts` — export `LiveControlFormSchema = z.object({})` and `LiveControlFormState`
- [x] T017 [P] [US2] [ZOD] Create `src/lib/schemas/navigation-sidebar.schema.ts` — export `NavigationSidebarSchema = z.object({})` and `NavigationSidebarState`
- [x] T018 [P] [US2] [ZOD] Create `src/lib/schemas/quick-actions-panel.schema.ts` — export `QuickActionsPanelSchema = z.object({})` and `QuickActionsPanelState`
- [x] T020 [P] [US2] [ZOD] Create `src/lib/schemas/top-bar.schema.ts` — export `TopBarSchema = z.object({})` and `TopBarState`

### Display-Data Schemas — organisms rendering sample data from `$lib/data/` (run in parallel)

- [x] T015 [P] [US2] [ZOD] Create `src/lib/schemas/dashboard-metric-grid.schema.ts` — export `DashboardMetricGridSchema` with `metrics: z.custom<MarketMetric[]>().default([])`; export `DashboardMetricGridState`; migrates to `z.array(MarketMetricSchema)` in Phase 6 (T074) after T044 exists
- [x] T019 [P] [US2] [ZOD] Create `src/lib/schemas/resource-cost-panel.schema.ts` — export `ResourceCostPanelSchema` with `resourceUsage: z.custom<ResourceUsage>().default({ tokensUsed: 4250, tokensTotal: 10000, backtestsUsed: 3, backtestsTotal: 10, queuePosition: 0, estimatedRuntime: '~42s', complexityScore: 67, planImpact: 'medium' })`; export `ResourceCostPanelState`; migrates to `ResourceUsageSchema.default({...})` in Phase 6 (T075) after T050 exists

### Typed Static-Data Schemas — organisms with const data shapes (run in parallel)

- [x] T021 [P] [US2] [ZOD] Create `src/lib/schemas/function-gateways.schema.ts` — export `FunctionGatewaysSchema` with `gatewayCards: z.custom<IFunctionGatewayCard[]>().default([])`; export `FunctionGatewaysState`
- [x] T022 [P] [US2] [ZOD] Create `src/lib/schemas/main-menu-group.schema.ts` — export `MainMenuGroupSchema` with `mainSections: z.custom<NavSection[]>().default([])`; export `MainMenuGroupState`
- [x] T023 [P] [US2] [ZOD] Create `src/lib/schemas/result-menu-group.schema.ts` — export `ResultMenuGroupSchema` with `resultSections: z.custom<NavSection[]>().default([])`; export `ResultMenuGroupState`

### Static-Data Component Wiring — organisms using const arrays (run in parallel)

- [x] T076 [P] [US2] Update `src/lib/components/organisms/FunctionGateways.svelte` — remove `const gatewayCards` and the `$lib/types` import; add `import { FunctionGatewaysSchema } from '$lib/schemas'`; initialize `let state = $state(FunctionGatewaysSchema.parse({}))`; assign `state.gatewayCards = [...]`; update template from `gatewayCards` to `state.gatewayCards`
- [x] T077 [P] [US2] Update `src/lib/components/organisms/MainMenuGroup.svelte` — remove `const mainSections` and the `$lib/types` import; add `import { MainMenuGroupSchema } from '$lib/schemas'`; initialize `let state = $state(MainMenuGroupSchema.parse({}))`; assign `state.mainSections = [...]`; update template from `mainSections` to `state.mainSections`
- [x] T078 [P] [US2] Update `src/lib/components/organisms/ResultMenuGroup.svelte` — remove `const resultSections` and the `$lib/types` import; add `import { ResultMenuGroupSchema } from '$lib/schemas'`; initialize `let state = $state(ResultMenuGroupSchema.parse({}))`; assign `state.resultSections = [...]`; update template from `resultSections` to `state.resultSections`

### Props Schema — StubSection

- [x] T024 [P] [US2] [ZOD] Create `src/lib/schemas/stub-section.schema.ts` — export `StubSectionSchema` with `title: z.string().default('Section')`; export `StubSectionProps = z.infer<typeof StubSectionSchema>` (named Props, not State)
- [x] T025 [US2] Update `src/lib/components/organisms/StubSection.svelte` — add `import type { StubSectionProps } from '$lib/schemas';` and annotate the destructured `$props()` call with `StubSectionProps` type (type inference only — no runtime `.parse()`)

### Complete Barrel

- [x] T026 [US2] Update `src/lib/schemas/index.ts` to re-export all 16 schema files (satisfies SC-005); verify all exports resolve without TypeScript errors

**Checkpoint**: US2 complete — exactly 16 `.schema.ts` files exist, `index.ts` exports all, `pnpm check` passes, SC-001 and SC-005 satisfied

---

## Phase 5: User Story 3 — Runtime Validation on State Initialization (Priority: P3)

**Goal**: Unit tests verify that each schema with typed fields rejects invalid inputs at runtime, and that `Schema.parse({})` reliably returns expected defaults for all stateful schemas.

**Independent Test**: Run `pnpm test:unit` — all schema tests pass. Confirm `PerformanceChartTabsSchema.safeParse({ activeChartTab: 'invalid' })` returns `{ success: false }`.

### Unit Tests (run in parallel — independent files)

- [x] T027 [P] [US3] Create `src/lib/schemas/__tests__/ai-chat-panel.schema.test.ts` — test: `parse({})` returns `{ chatInput: '', messages: [] }`; test: `safeParse({ chatInput: 123 })` returns `{ success: false }`
- [x] T028 [P] [US3] Create `src/lib/schemas/__tests__/ai-research-box.schema.test.ts` — test: `parse({})` returns `{ aiText: '', validationError: false }`; test: `safeParse({ validationError: 'yes' })` returns `{ success: false }`
- [x] T029 [P] [US3] Create `src/lib/schemas/__tests__/performance-chart-tabs.schema.test.ts` — test: `parse({})` returns `{ activeChartTab: 'equity-curve' }`; test: `safeParse({ activeChartTab: 'invalid-tab' })` returns `{ success: false }` (enum validation)
- [x] T030 [P] [US3] Create `src/lib/schemas/__tests__/performance-metric-grid.schema.test.ts` — test: `parse({})` returns `{ tiles: [], draggedIndex: null, editingTileId: null, editValue: '', modalOpen: false }`; test: `safeParse({ draggedIndex: 'not-a-number' })` returns `{ success: false }`
- [x] T031 [P] [US3] Create `src/lib/schemas/__tests__/empty-schemas.schema.test.ts` — verify `parse({})` returns `{}` for 6 truly empty-schema organisms (`AIReviewPanel`, `AIReviewSidebar`, `LiveControlForm`, `NavigationSidebar`, `QuickActionsPanel`, `TopBar`); verify `DashboardMetricGridSchema.parse({}).metrics` equals `[]`; verify `ResourceCostPanelSchema.parse({}).resourceUsage.tokensUsed` equals `4250` and `.planImpact` equals `'medium'`; for the 3 typed static-data schemas (`FunctionGateways`, `MainMenuGroup`, `ResultMenuGroup`) verify objects with the expected `[]` defaults; satisfies SC-002 for US2 schemas
- [x] T031a [US3] Run `pnpm test:unit` and confirm all schema tests in `src/lib/schemas/__tests__/` pass

**Checkpoint**: US3 complete — runtime validation confirmed, SC-002 satisfied

---

## Phase 6: User Story 4 — Zod Schemas for All Data-Contract Types (Priority: P4)

**Goal**: Create 18 Zod schema files under `src/lib/schemas/types/` — one per TypeScript interface in `src/lib/types/index.ts` that appears in `src/lib/data/` or is consumed by organism schemas. Add `PerfSummaryItem` interface to `lib/types/index.ts` first.

**Independent Test**: Count files in `src/lib/schemas/types/` — expect exactly 19 files (18 `.schema.ts` + 1 `index.ts`). Confirm `MarketMetricSchema.safeParse({ id: 1 })` returns `{ success: false }` (id must be string).

### Prerequisites

- [x] T037 Add `PerfSummaryItem` interface to `src/lib/types/index.ts` — `export interface PerfSummaryItem { label: string; value: string }` (required before its schema can be created)

### Type Schema Creation — leaf types with no nested schema refs (run in parallel)

- [x] T038 [P] [US4] [ZOD] Create `src/lib/schemas/types/time-series-point.schema.ts` — export `TimeSeriesPointSchema = z.object({ date: z.string(), value: z.number() })`; export `TimeSeriesPoint = z.infer<...>`
- [x] T039 [P] [US4] [ZOD] Create `src/lib/schemas/types/monthly-return.schema.ts` — export `MonthlyReturnSchema = z.object({ month: z.string(), value: z.number() })`
- [x] T040 [P] [US4] [ZOD] Create `src/lib/schemas/types/metric-tile.schema.ts` — export `MetricTileSchema = z.object({ id: z.string(), label: z.string(), value: z.string(), unit: z.string(), order: z.number() })`
- [x] T041 [P] [US4] [ZOD] Create `src/lib/schemas/types/nav-section.schema.ts` — export `NavSectionSchema` with `id: z.enum([...SectionId values])`, `path: z.string()`, `labelKey: z.string()`, `icon: z.string()`, `group: z.enum(['main', 'result'])`
- [x] T042 [P] [US4] [ZOD] Create `src/lib/schemas/types/chat-message.schema.ts` — export `ChatMessageSchema = z.object({ id: z.string(), role: z.enum(['user', 'assistant']), content: z.string(), timestamp: z.string() })`
- [x] T043 [P] [US4] [ZOD] Create `src/lib/schemas/types/function-gateway-card.schema.ts` — export `FunctionGatewayCardSchema` with `id: z.enum([...SectionId values])`, `titleKey: z.string()`, `descriptionKey: z.string()`, `icon: z.string()`
- [x] T044 [P] [US4] [ZOD] Create `src/lib/schemas/types/market-metric.schema.ts` — export `MarketMetricSchema` with `id: z.string()`, `label: z.string()`, `value: z.string()`, `delta: z.string()`, `deltaPositive: z.boolean()`, `category: z.enum(['market', 'risk', 'rates', 'usage'])`
- [x] T045 [P] [US4] [ZOD] Create `src/lib/schemas/types/market-regime.schema.ts` — export `MarketRegimeSchema` with `id: z.string()`, `name: z.string()`, `status: z.enum(['active', 'inactive', 'warning'])`, `logicDescription: z.string()`, `indicators: z.array(z.string())`
- [x] T046 [P] [US4] [ZOD] Create `src/lib/schemas/types/screener-result.schema.ts` — export `ScreenerResultSchema` with all 9 fields as `z.string()` / `z.number()` per interface
- [x] T047 [P] [US4] [ZOD] Create `src/lib/schemas/types/regime-breakdown.schema.ts` — export `RegimeBreakdownSchema = z.object({ regime: z.string(), returnPct: z.number(), maxDrawdown: z.number(), winRate: z.number(), tradeCount: z.number() })`
- [x] T048 [P] [US4] [ZOD] Create `src/lib/schemas/types/strategy.schema.ts` — export `StrategySchema = z.object({ market: z.string(), fundamentalFilter: z.string(), technicalFilter: z.string(), backtestPeriod: z.string(), positionSize: z.string(), riskRule: z.string() })`
- [x] T049 [P] [US4] [ZOD] Create `src/lib/schemas/types/risk-flag.schema.ts` — export `RiskFlagSchema` with `id: z.string()`, `label: z.string()`, `severity: z.enum(['high', 'medium', 'low'])`, `description: z.string()`
- [x] T050 [P] [US4] [ZOD] Create `src/lib/schemas/types/resource-usage.schema.ts` — export `ResourceUsageSchema` with all 8 fields; `planImpact: z.enum(['low', 'medium', 'high'])`
- [x] T051 [P] [US4] [ZOD] Create `src/lib/schemas/types/trade-record.schema.ts` — export `TradeRecordSchema` with all 14 fields; `direction: z.enum(['Long', 'Short'])`
- [x] T052 [P] [US4] [ZOD] Create `src/lib/schemas/types/sentiment-event.schema.ts` — export `SentimentEventSchema` with all 7 fields; `type: z.enum(['news','earnings','fed','macro','insider','social'])`, `sentiment: z.enum(['positive','negative','neutral'])`
- [x] T053 [P] [US4] [ZOD] Create `src/lib/schemas/types/perf-summary-item.schema.ts` — depends on T037; export `PerfSummaryItemSchema = z.object({ label: z.string(), value: z.string() })`

### Type Schema Creation — composite types (after leaf schemas exist)

- [x] T054 [US4] [ZOD] Create `src/lib/schemas/types/ai-review.schema.ts` — depends on T049 (RiskFlagSchema); export `AIReviewSchema` with `grade: z.string()`, `confidence: z.enum(['high', 'medium', 'low'])`, `riskFlags: z.array(RiskFlagSchema)`
- [x] T055 [US4] [ZOD] Create `src/lib/schemas/types/backtest-result.schema.ts` — depends on T038, T039 (TimeSeriesPoint, MonthlyReturn); export `BacktestResultSchema` with all 12 fields using `z.array(TimeSeriesPointSchema)` for curve fields and `z.array(MonthlyReturnSchema)` for monthlyReturns

### Type Schema Barrel

- [x] T056 [US4] Create `src/lib/schemas/types/index.ts` — re-export all 18 type schemas (satisfies SC-006); verify zero TypeScript errors

### Organism Schema Migration (FR-012) — after T040–T043 exist

- [x] T057 [P] [US4] Update `src/lib/schemas/ai-chat-panel.schema.ts` — replace `z.custom<ChatMessage[]>()` with `z.array(ChatMessageSchema)` (import from `$lib/schemas/types`); update `AIChatPanelSchema` definition
- [x] T058 [P] [US4] Update `src/lib/schemas/performance-metric-grid.schema.ts` — replace `z.custom<MetricTile[]>()` with `z.array(MetricTileSchema)`
- [x] T059 [P] [US4] Update `src/lib/schemas/function-gateways.schema.ts` — replace `z.custom<FunctionGatewayCard[]>()` with `z.array(FunctionGatewayCardSchema)`
- [x] T060 [P] [US4] Update `src/lib/schemas/main-menu-group.schema.ts` — replace `z.custom<NavSection[]>()` with `z.array(NavSectionSchema)`
- [x] T061 [P] [US4] Update `src/lib/schemas/result-menu-group.schema.ts` — replace `z.custom<NavSection[]>()` with `z.array(NavSectionSchema)`

### AIReviewPanel Schema & Component Wiring — after T054 (AIReviewSchema) exists

- [x] T070 [US4] Update `src/lib/schemas/ai-review-panel.schema.ts` — depends on T054; replace `z.object({})` with `z.object({ review: AIReviewSchema.default({ grade: '', confidence: 'low', riskFlags: [] }) })`; import `AIReviewSchema` from `$lib/schemas/types`; update `AIReviewPanelState` type export; `review` is non-nullable so `state.review.confidence` requires no optional chaining
- [x] T071 [US4] Update `src/lib/components/organisms/AIReviewPanel.svelte` — depends on T070; add `import { AIReviewPanelSchema } from '$lib/schemas'`; initialize `let state = $state(AIReviewPanelSchema.parse({}))`; assign `state.review = sampleAIReview`; update template references from `sampleAIReview.X` to `state.review.X` with no optional chaining

### DashboardMetricGrid Schema Migration & Wiring — after T044 (MarketMetricSchema) exists

- [ ] T074 [P] [US4] Update `src/lib/schemas/dashboard-metric-grid.schema.ts` — depends on T044; replace `z.custom<MarketMetric[]>()` with `z.array(MarketMetricSchema)`; import `MarketMetricSchema` from `$lib/schemas/types`; update `DashboardMetricGridState` type export
- [x] T072 [US4] Update `src/lib/components/organisms/DashboardMetricGrid.svelte` — depends on T015; add `import { DashboardMetricGridSchema } from '$lib/schemas'`; initialize `let state = $state(DashboardMetricGridSchema.parse({}))`; assign `state.metrics = sampleMarketMetrics`; update template reference from `sampleMarketMetrics` to `state.metrics`

### ResourceCostPanel Schema Migration & Wiring — after T050 (ResourceUsageSchema) exists

- [ ] T075 [P] [US4] Update `src/lib/schemas/resource-cost-panel.schema.ts` — depends on T050; replace `z.custom<ResourceUsage>()` with `ResourceUsageSchema`; import `ResourceUsageSchema` from `$lib/schemas/types`; retain `.default({...})` on the field; update `ResourceCostPanelState` type export
- [x] T073 [US4] Update `src/lib/components/organisms/ResourceCostPanel.svelte` — depends on T019; add `import { ResourceCostPanelSchema } from '$lib/schemas'`; initialize `let state = $state(ResourceCostPanelSchema.parse({}))`; assign `state.resourceUsage = sampleResourceUsage`; update all template references from `sampleResourceUsage.X` to `state.resourceUsage.X`

**Checkpoint**: US4 complete — 18 type schema files in `src/lib/schemas/types/`, all organism `z.custom<T[]>()` replaced, `AIReviewPanel`, `DashboardMetricGrid`, and `ResourceCostPanel` wired to schema state, SC-006 satisfied

---

## Phase 7: User Story 5 — Zod Schemas for Global State Singletons (Priority: P5)

**Goal**: Each global state singleton class (`AppState`, `BacktestState`, `StrategyState`) derives its default values from a Zod schema. Hardcoded defaults in class bodies are removed.

**Independent Test**: `AppStateSchema.parse({})` returns `{ currentLocale: 'en', backtestPrefillSymbol: '', simulatedMetrics: { totalReturn: '42.8', maxDrawdown: '-18.2', winRate: '58.3' } }`. `BacktestStateSchema.safeParse({ mode: 'InvalidMode' })` returns `{ success: false }`.

### State Schema Creation (run in parallel — independent files)

- [x] T062 [P] [US5] [ZOD] Create `src/lib/schemas/state/app-state.schema.ts` — export `AppStateSchema = z.object({ currentLocale: z.enum(['en', 'zh-TW']).default('en'), backtestPrefillSymbol: z.string().default(''), simulatedMetrics: z.object({ totalReturn: z.string().default('42.8'), maxDrawdown: z.string().default('-18.2'), winRate: z.string().default('58.3') }) })`; export `AppStateData = z.infer<typeof AppStateSchema>`
- [x] T063 [P] [US5] [ZOD] Create `src/lib/schemas/state/backtest-state.schema.ts` — export `BacktestStateSchema` with `mode: z.enum([...BacktestMode values]).default('Single Stock')`, `initialCapital: z.string().default('100000')`, `startDate: z.string().default('2020-01-01')`, `endDate: z.string().default('2024-12-31')`, `universe: z.string().default('SPY')`, `timeframe: z.string().default('Daily')`, `direction: z.enum(['Long', 'Short', 'Both']).default('Long')`, `selectedOrderTypes: z.array(z.enum([...OrderType values])).default(['Market'])` (FR-014); export `BacktestStateData`
- [x] T064 [P] [US5] [ZOD] Create `src/lib/schemas/state/strategy-state.schema.ts` — depends on T048 (StrategySchema); export `StrategyStateSchema = z.object({ inputText: z.string().default(''), parsedStrategy: StrategySchema.nullable().default(null) })`; export `StrategyStateData`

### State Schema Barrel

- [x] T065 [US5] Create `src/lib/schemas/state/index.ts` — re-export `AppStateSchema`, `BacktestStateSchema`, `StrategyStateSchema` and their inferred types

### State Class Updates (each depends on its schema)

- [x] T066 [US5] Update `src/lib/state/app.svelte.ts` — import `AppStateSchema` from `$lib/schemas/state`; replace each hardcoded class-property default with `AppStateSchema.parse({}).fieldName`; remove any duplicate literal values from the class body
- [x] T067 [US5] Update `src/lib/state/backtest.svelte.ts` — import `BacktestStateSchema` from `$lib/schemas/state`; replace hardcoded defaults in class properties and `reset()` method with schema-derived values; initialize `selectedOrderTypes` as `new SvelteSet(BacktestStateSchema.parse({}).selectedOrderTypes)` (FR-014)
- [x] T068 [US5] Update `src/lib/state/strategy.svelte.ts` — import `StrategyStateSchema` from `$lib/schemas/state`; replace hardcoded defaults with `StrategyStateSchema.parse({}).fieldName`

### Unit Tests for State Schemas

- [x] T069 [P] [US5] Create `src/lib/schemas/__tests__/state-schemas.schema.test.ts` — test: `AppStateSchema.parse({})` returns expected defaults; test: `BacktestStateSchema.safeParse({ mode: 'InvalidMode' })` returns `{ success: false }`; test: `StrategyStateSchema.parse({})` returns `{ inputText: '', parsedStrategy: null }`; test: `BacktestStateSchema.parse({}).selectedOrderTypes` equals `['Market']` (SC-007)

**Checkpoint**: US5 complete — 3 state schemas created, 3 state classes updated to use schema defaults, SC-007 satisfied

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation that all success criteria are met

- [x] T031a [US3] Run `pnpm test:unit` and confirm all schema tests in `src/lib/schemas/__tests__/` pass (includes state schema tests from T069)
- [x] T032 Run `pnpm check` to verify TypeScript compilation passes with zero type errors across all updated organism components, new schema files, and updated state classes (SC-003)
- [x] T033 [P] Run `pnpm lint` to verify prettier + ESLint formatting compliance on all new `.schema.ts` files and updated `.svelte`/`.ts` files
- [x] T034 [P] Verify SC-004 (revised): confirm state singletons import only from `$lib/schemas/state` and no hardcoded default literals remain in class bodies; confirm organism schemas do not capture global state fields (FR-005)
- [x] T035 [P] Verify `ci-sca` job exists in `.github/workflows/ci.yaml` and is triggered on PR to main — no CRITICAL findings; HIGH requires approved waiver (Constitution Rule 7)
- [x] T036 [P] Verify `ci-secrets-scan` job exists in `.github/workflows/ci.yaml` and is triggered on PR to main — any finding blocks merge with no waiver permitted (Constitution Rule 7)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001 complete) — BLOCKS all user story tasks
- **Phase 3 (US1)**: Depends on Phase 2 (T003 complete) — T004–T007 are parallel; T008–T011 each depend on their respective schema (T008→T004, T009→T005, T010→T006, T011→T007); T012 depends on T004–T007
- **Phase 4 (US2)**: Depends on Phase 2 (T003 complete) — T013–T024 are parallel; T025 depends on T024; T026 depends on T013–T024
- **Phase 5 (US3)**: Depends on Phase 3 completing T004–T007 (schemas must exist to test) and Phase 4 completing T013–T024 for empty schema tests; T027–T031 parallel; T031a moves to Phase 8
- **Phase 6 (US4)**: Depends on Phase 2 (T003) — T037 must complete before T053; T038–T052 are parallel leaf schemas; T054 depends on T049; T055 depends on T038+T039; T056 depends on T038–T055; T057–T061 (FR-012 migration) depend on T040–T043; T074 depends on T044 (MarketMetricSchema); T075 depends on T050 (ResourceUsageSchema); T072 depends on T015 (already done); T073 depends on T019 (already done)
- **Phase 7 (US5)**: Depends on T048 (StrategySchema) from Phase 6 — T062–T064 are parallel; T065 depends on T062–T064; T066–T068 each depend on their respective schema; T069 depends on T062–T064
- **Phase 8 (Polish)**: Depends on all prior phases complete; T031a is now gated here (all schema tests); T035–T036 verify existing CI jobs

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependency on US2 or US3
- **US2 (P2)**: Can start after Phase 2 — independent of US1 (different schema files)
- **US3 (P3)**: Depends on US1 schemas existing (T004–T007) — tests the schemas created in US1
- **US4 (P4)**: Depends on Phase 2 only — leaf type schemas are independent; composite schemas depend on leaf schemas within Phase 6; FR-012 organism migrations depend on their respective type schemas
- **US5 (P5)**: Depends on T048 (StrategySchema) from US4 — `StrategyStateSchema` references `StrategySchema`

### Within Phase 3 (US1)

```
T003 → T004, T005, T006, T007 (parallel)
           ↓       ↓       ↓       ↓
         T008    T009    T010    T011
           ↓       ↓       ↓       ↓
                    T012
```

### Within Phase 4 (US2)

```
T003 → T013, T014, T015, T016, T017, T018, T019, T020, T021, T022, T023, T024 (all parallel)
                                          T025 (depends on T024)
                                          T026 (depends on T013–T024)
```

---

## Parallel Execution Examples

### Phase 3 (US1) — Schema creation batch

```
Launch simultaneously:
- T004: Create ai-chat-panel.schema.ts
- T005: Create ai-research-box.schema.ts
- T006: Create performance-chart-tabs.schema.ts
- T007: Create performance-metric-grid.schema.ts

Then launch simultaneously (each after its schema):
- T008: Update AIChatPanel.svelte
- T009: Update AIResearchBox.svelte
- T010: Update PerformancdeChartTabs.svelte
- T011: Update PerformanceMetricGrid.svelte
```

### Phase 4 (US2) — Empty/typed schema batch

```
Launch simultaneously (all 12 remaining schemas):
T013 through T024 — all independent files

Then T025 (StubSection component), then T026 (barrel)
```

### Phase 5 (US3) — Test batch

```
Launch simultaneously:
- T027: ai-chat-panel test
- T028: ai-research-box test
- T029: performance-chart-tabs test
- T030: performance-metric-grid test

Then T031: run pnpm test:unit
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Install zod, verify BDD file
2. Complete Phase 2: Create index.ts skeleton
3. Complete Phase 3 (US1): 4 schema files + 4 component updates
4. **STOP and VALIDATE**: `pnpm check` passes; organisms render; `parse({})` returns correct defaults
5. This is the minimum shippable increment — state has a typed, validated source of truth

### Incremental Delivery

1. MVP: Phase 1 + 2 + 3 → US1 schema pattern established
2. Phase 4 (US2) → Full coverage, all 16 organisms have schemas
3. Phase 5 (US3) → Runtime validation tests, SC-002 confirmed
4. Phase 6 (US4) → 18 data-type schemas, FR-012 organism migrations, SC-006 satisfied
5. Phase 7 (US5) → 3 state schemas, state class updates, SC-007 satisfied
6. Phase 8 → All success criteria verified and documented

### Parallel Team Strategy

With two developers:

- Developer A: Phase 3 (US1) — 4 stateful organism schemas + component updates
- Developer B: Phase 4 (US2) — 12 remaining organism schemas (can start after Phase 2)

Both depend only on Phase 2 (T003) and can proceed independently.

---

## Notes

- `[P]` tasks operate on different files and have no incomplete predecessors — safe to launch in parallel
- `[ZOD]` marks the schema creation tasks per Constitution Rule 12 (step 4 of Schema-First workflow)
- `[BDD]` task (T002) verifies the feature file created in the plan phase
- The `PerformancdeChartTabs.svelte` filename typo is preserved — only the schema file uses the corrected spelling (`performance-chart-tabs.schema.ts`)
- `PerformanceMetricGrid.svelte`: after replacing with `state = $state(Schema.parse({}))`, initialize tiles with `state.tiles = [...defaultMetricTiles]` on the next line
- `StubSection`: schema import uses `type` keyword only — no runtime `.parse()` call
- State singleton classes must use `Schema.parse({}).fieldName` for all defaults; T034 now verifies schema-driven init (not "unchanged") before marking feature complete
- `StrategyStateSchema` imports `StrategySchema` from `$lib/schemas/types` — Phase 7 depends on Phase 6 completing T048
