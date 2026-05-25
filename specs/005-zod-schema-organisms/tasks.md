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

- [x] T004 [P] [US1] [ZOD] Create `src/lib/schemas/ai-chat-panel.schema.ts` — export `AIChatPanelSchema` with `chatInput: z.string().default('')` and `messages: z.custom<ChatMessage[]>().default([])`; do NOT export any inferred type
- [x] T005 [P] [US1] [ZOD] Create `src/lib/schemas/ai-research-box.schema.ts` — export `AIResearchBoxSchema` with `aiText: z.string().default('')` and `validationError: z.boolean().default(false)`; do NOT export any inferred type
- [x] T006 [P] [US1] [ZOD] Create `src/lib/schemas/performance-chart-tabs.schema.ts` — export `PerformanceChartTabsSchema` with `activeChartTab: z.enum(['equity-curve', 'drawdown', 'benchmark-overlay', 'monthly-heatmap']).default('equity-curve')`; do NOT export any inferred type (note: file uses corrected spelling; organism file typo `PerformancdeChartTabs` is unchanged)
- [x] T007 [P] [US1] [ZOD] Create `src/lib/schemas/performance-metric-grid.schema.ts` — export `PerformanceMetricGridSchema` with `tiles: z.custom<MetricTile[]>().default([])`, `draggedIndex: z.number().nullable().default(null)`, `editingTileId: z.string().nullable().default(null)`, `editValue: z.string().default('')`, `modalOpen: z.boolean().default(false)`; do NOT export any inferred type

### Component Updates (run in parallel after their schema is created)

- [x] T008 [P] [US1] Update `src/lib/components/organisms/AIChatPanel.svelte` — replace `let chatInput = $state('')` and `let messages = $state<ChatMessage[]>([])` with `import { AIChatPanelSchema } from '$lib/schemas'; type State = z.infer<typeof AIChatPanelSchema>; let state = $state<State>(AIChatPanelSchema.parse({}));`; update all template and handler references from `chatInput`/`messages` to `state.chatInput`/`state.messages`
- [x] T009 [P] [US1] Update `src/lib/components/organisms/AIResearchBox.svelte` — replace `let aiText = $state('')` and `let validationError = $state(false)` with `import { AIResearchBoxSchema } from '$lib/schemas'; type State = z.infer<typeof AIResearchBoxSchema>; let state = $state<State>(AIResearchBoxSchema.parse({}));`; update all references to `state.aiText`/`state.validationError`
- [x] T010 [P] [US1] Update `src/lib/components/organisms/PerformancdeChartTabs.svelte` — replace `let activeChartTab = $state<ChartTab>('equity-curve')` with `import { PerformanceChartTabsSchema } from '$lib/schemas'; type State = z.infer<typeof PerformanceChartTabsSchema>; let state = $state<State>(PerformanceChartTabsSchema.parse({}));`; update all template references from `activeChartTab` to `state.activeChartTab`
- [x] T011 [US1] Update `src/lib/components/organisms/PerformanceMetricGrid.svelte` — replace all 5 individual `$state` declarations (`tiles`, `draggedIndex`, `editingTileId`, `editValue`, `modalOpen`) with `import { PerformanceMetricGridSchema } from '$lib/schemas'; type State = z.infer<typeof PerformanceMetricGridSchema>; let state = $state<State>(PerformanceMetricGridSchema.parse({})); state.tiles = [...defaultMetricTiles];`; update all template and handler references (e.g., `tiles` → `state.tiles`, `draggedIndex = index` → `state.draggedIndex = index`); use direct property assignment for all mutations

### Barrel Update

- [x] T012 [US1] Update `src/lib/schemas/index.ts` to export US1 schemas: `ai-chat-panel`, `ai-research-box`, `performance-chart-tabs`, `performance-metric-grid`; barrel exports Zod schema constants only — no `export type` re-exports

**Checkpoint**: US1 complete — 4 schemas created, 4 components updated, `pnpm check` passes, organisms render correctly

---

## Phase 4: User Story 2 — Schema Files for All Organisms (Priority: P2)

**Goal**: All 12 remaining organisms receive schema files, ensuring full coverage across the atomic design system. The index.ts barrel exports all 16 schemas.

**Independent Test**: Count files in `src/lib/schemas/` — expect exactly 17 files (16 `.schema.ts` + 1 `index.ts`). Run `pnpm check` — zero errors. Verify `NavigationSidebarSchema.parse({})` returns `{}`.

### Empty Schemas — organisms with no local state (run in parallel)

- [x] T013 [P] [US2] [ZOD] Create `src/lib/schemas/ai-review-panel.schema.ts` — export `AIReviewPanelSchema = z.object({})`; do NOT export any inferred type
- [x] T014 [P] [US2] [ZOD] Create `src/lib/schemas/ai-review-sidebar.schema.ts` — export `AIReviewSidebarSchema = z.object({})`; do NOT export any inferred type
- [x] T016 [P] [US2] [ZOD] Create `src/lib/schemas/live-control-form.schema.ts` — export `LiveControlFormSchema = z.object({})`; do NOT export any inferred type
- [x] T017 [P] [US2] [ZOD] Create `src/lib/schemas/navigation-sidebar.schema.ts` — export `NavigationSidebarSchema = z.object({})`; do NOT export any inferred type
- [x] T018 [P] [US2] [ZOD] Create `src/lib/schemas/quick-actions-panel.schema.ts` — export `QuickActionsPanelSchema = z.object({})`; do NOT export any inferred type
- [x] T020 [P] [US2] [ZOD] Create `src/lib/schemas/top-bar.schema.ts` — export `TopBarSchema = z.object({})`; do NOT export any inferred type

### Display-Data Schemas — organisms rendering sample data from `$lib/shared-mockdata/` (run in parallel)

- [x] T015 [P] [US2] [ZOD] Create `src/lib/schemas/dashboard-metric-grid.schema.ts` — export `DashboardMetricGridSchema` with `metrics: z.custom<MarketMetric[]>().default([])`; do NOT export any inferred type; migrates to `z.array(MarketMetricSchema)` in Phase 6 (T074) after T044 exists
- [x] T019 [P] [US2] [ZOD] Create `src/lib/schemas/resource-cost-panel.schema.ts` — export `ResourceCostPanelSchema` with `resourceUsage: z.custom<ResourceUsage>().default({ tokensUsed: 4250, tokensTotal: 10000, backtestsUsed: 3, backtestsTotal: 10, queuePosition: 0, estimatedRuntime: '~42s', complexityScore: 67, planImpact: 'medium' })`; do NOT export any inferred type; migrates to `ResourceUsageSchema.default({...})` in Phase 6 (T075) after T050 exists

### Typed Static-Data Schemas — organisms with const data shapes (run in parallel)

- [x] T021 [P] [US2] [ZOD] Create `src/lib/schemas/function-gateways.schema.ts` — export `FunctionGatewaysSchema` with `gatewayCards: z.custom<FunctionGatewayCard[]>().default([])`; do NOT export any inferred type
- [x] T022 [P] [US2] [ZOD] Create `src/lib/schemas/main-menu-group.schema.ts` — export `MainMenuGroupSchema` with `mainSections: z.custom<NavSection[]>().default([])`; do NOT export any inferred type
- [x] T023 [P] [US2] [ZOD] Create `src/lib/schemas/result-menu-group.schema.ts` — export `ResultMenuGroupSchema` with `resultSections: z.custom<NavSection[]>().default([])`; do NOT export any inferred type

### Static-Data Component Wiring — organisms using const arrays (run in parallel)

- [x] T076 [P] [US2] Update `src/lib/components/organisms/FunctionGateways.svelte` — remove `const gatewayCards` and the `$lib/types` import; add `import { FunctionGatewaysSchema } from '$lib/schemas'`; initialize `let state = $state(FunctionGatewaysSchema.parse({}))`; assign `state.gatewayCards = [...]`; update template from `gatewayCards` to `state.gatewayCards`
- [x] T077 [P] [US2] Update `src/lib/components/organisms/MainMenuGroup.svelte` — remove `const mainSections` and the `$lib/types` import; add `import { MainMenuGroupSchema } from '$lib/schemas'`; initialize `let state = $state(MainMenuGroupSchema.parse({}))`; assign `state.mainSections = [...]`; update template from `mainSections` to `state.mainSections`
- [x] T078 [P] [US2] Update `src/lib/components/organisms/ResultMenuGroup.svelte` — remove `const resultSections` and the `$lib/types` import; add `import { ResultMenuGroupSchema } from '$lib/schemas'`; initialize `let state = $state(ResultMenuGroupSchema.parse({}))`; assign `state.resultSections = [...]`; update template from `resultSections` to `state.resultSections`

### Props Schema — StubSection

- [x] T024 [P] [US2] [ZOD] Create `src/lib/schemas/stub-section.schema.ts` — export `StubSectionSchema` with `title: z.string().default('Section')`; do NOT export any inferred type
- [x] T025 [US2] Update `src/lib/components/organisms/StubSection.svelte` — add `import { StubSectionSchema } from '$lib/schemas'`; derive the prop type locally: `type Props = z.infer<typeof StubSectionSchema>`; annotate the destructured `$props()` call with `Props` type (type inference only — no runtime `.parse()`)

### Complete Barrel

- [x] T026 [US2] Update `src/lib/schemas/index.ts` to re-export all 16 schema files (satisfies SC-005); barrel exports Zod schema constants only — no `export type` re-exports; verify all exports resolve without TypeScript errors

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

**Goal**: Create 21 Zod schema files under `src/lib/schemas/` — one per TypeScript interface in `src/lib/types/index.ts` that appears in `src/lib/data/` or is consumed by organism schemas (18 original + `BacktestParams`, `UsageMetric`, `MetricEditPayload` added as T082–T084). Add `PerfSummaryItem` interface to `lib/types/index.ts` first.

**Independent Test**: Count schema files in `src/lib/schemas/` — expect exactly 38 `.schema.ts` files at this checkpoint (16 organism + 21 data-contract; the 3 state schemas are added in Phase 7) plus 1 `index.ts`. Confirm `MarketMetricSchema.safeParse({ id: 1 })` returns `{ success: false }` (id must be string).

### Prerequisites

- [x] T037 Add `PerfSummaryItem` interface to `src/lib/types/index.ts` — `export interface PerfSummaryItem { label: string; value: string }` (required before its schema can be created)

### Type Schema Creation — leaf types with no nested schema refs (run in parallel)

- [x] T038 [P] [US4] [ZOD] Create `src/lib/schemas/time-series-point.schema.ts` — export `TimeSeriesPointSchema = z.object({ date: z.string(), value: z.number() })`; do NOT export any inferred type
- [x] T039 [P] [US4] [ZOD] Create `src/lib/schemas/monthly-return.schema.ts` — export `MonthlyReturnSchema = z.object({ month: z.string(), value: z.number() })`; do NOT export any inferred type
- [x] T040 [P] [US4] [ZOD] Create `src/lib/schemas/metric-tile.schema.ts` — export `MetricTileSchema = z.object({ id: z.string(), label: z.string(), value: z.string(), unit: z.string(), order: z.number() })`; do NOT export any inferred type
- [x] T041 [P] [US4] [ZOD] Create `src/lib/schemas/nav-section.schema.ts` — export `NavSectionSchema` with `id: z.enum([...SectionId values])`, `path: z.string()`, `labelKey: z.string()`, `icon: z.string()`, `group: z.enum(['main', 'result'])`; do NOT export any inferred type
- [x] T042 [P] [US4] [ZOD] Create `src/lib/schemas/chat-message.schema.ts` — export `ChatMessageSchema = z.object({ id: z.string(), role: z.enum(['user', 'assistant']), content: z.string(), timestamp: z.string() })`; do NOT export any inferred type
- [x] T043 [P] [US4] [ZOD] Create `src/lib/schemas/function-gateway-card.schema.ts` — export `FunctionGatewayCardSchema` with `id: z.enum([...SectionId values])`, `titleKey: z.string()`, `descriptionKey: z.string()`, `icon: z.string()`; do NOT export any inferred type
- [x] T044 [P] [US4] [ZOD] Create `src/lib/schemas/market-metric.schema.ts` — export `MarketMetricSchema` with `id: z.string()`, `label: z.string()`, `value: z.string()`, `delta: z.string()`, `deltaPositive: z.boolean()`, `category: z.enum(['market', 'risk', 'rates', 'usage'])`; do NOT export any inferred type
- [x] T045 [P] [US4] [ZOD] Create `src/lib/schemas/market-regime.schema.ts` — export `MarketRegimeSchema` with `id: z.string()`, `name: z.string()`, `status: z.enum(['active', 'inactive', 'warning'])`, `logicDescription: z.string()`, `indicators: z.array(z.string())`; do NOT export any inferred type
- [x] T046 [P] [US4] [ZOD] Create `src/lib/schemas/screener-result.schema.ts` — export `ScreenerResultSchema` with all 9 fields as `z.string()` / `z.number()` per interface; do NOT export any inferred type
- [x] T047 [P] [US4] [ZOD] Create `src/lib/schemas/regime-breakdown.schema.ts` — export `RegimeBreakdownSchema = z.object({ regime: z.string(), returnPct: z.number(), maxDrawdown: z.number(), winRate: z.number(), tradeCount: z.number() })`; do NOT export any inferred type
- [x] T048 [P] [US4] [ZOD] Create `src/lib/schemas/strategy.schema.ts` — export `StrategySchema = z.object({ market: z.string(), fundamentalFilter: z.string(), technicalFilter: z.string(), backtestPeriod: z.string(), positionSize: z.string(), riskRule: z.string() })`; do NOT export any inferred type
- [x] T049 [P] [US4] [ZOD] Create `src/lib/schemas/risk-flag.schema.ts` — export `RiskFlagSchema` with `id: z.string()`, `label: z.string()`, `severity: z.enum(['high', 'medium', 'low'])`, `description: z.string()`; do NOT export any inferred type
- [x] T050 [P] [US4] [ZOD] Create `src/lib/schemas/resource-usage.schema.ts` — export `ResourceUsageSchema` with all 8 fields; `planImpact: z.enum(['low', 'medium', 'high'])`; do NOT export any inferred type
- [x] T051 [P] [US4] [ZOD] Create `src/lib/schemas/trade-record.schema.ts` — export `TradeRecordSchema` with all 14 fields; `direction: z.enum(['Long', 'Short'])`; do NOT export any inferred type
- [x] T052 [P] [US4] [ZOD] Create `src/lib/schemas/sentiment-event.schema.ts` — export `SentimentEventSchema` with all 7 fields; `type: z.enum(['news','earnings','fed','macro','insider','social'])`, `sentiment: z.enum(['positive','negative','neutral'])`; do NOT export any inferred type
- [x] T053 [P] [US4] [ZOD] Create `src/lib/schemas/perf-summary-item.schema.ts` — depends on T037; export `PerfSummaryItemSchema = z.object({ label: z.string(), value: z.string() })`; do NOT export any inferred type
- [x] T082 [P] [US4] [ZOD] Create `src/lib/schemas/backtest-params.schema.ts` — export `BacktestParamsSchema` with `mode: z.enum(['Single Stock', 'Watchlist', 'Screener Result', 'Index Universe', 'Strategy Comparison', 'Benchmark Comparison'])`, `initialCapital: z.number()`, `startDate: z.string()`, `endDate: z.string()`, `market: z.string()`, `universe: z.string()`, `timeframe: z.string()`, `commissionModel: z.string()`, `slippageModel: z.string()`, `positionSize: z.string()`, `stopLoss: z.number()`, `takeProfit: z.number()`, `direction: z.enum(['Long', 'Short', 'Both'])`, `rebalanceFrequency: z.string()`, `orderTypes: z.array(z.enum(['Market', 'Limit', 'Stop', 'Stop-Limit', 'Trailing Stop', 'Bracket', 'OCO', 'Short Sell']))`; no `.default()` required (config payload); do NOT export any inferred type — consumers declare `type BacktestParams = z.infer<typeof BacktestParamsSchema>` locally at the import site
- [x] T083 [P] [US4] [ZOD] Create `src/lib/schemas/usage-metric.schema.ts` — export `UsageMetricSchema = z.object({ id: z.string(), label: z.string(), value: z.string(), description: z.string().optional() })`; do NOT export any inferred type — consumers declare `type UsageMetric = z.infer<typeof UsageMetricSchema>` locally at the import site
- [x] T084 [P] [US4] [ZOD] Create `src/lib/schemas/metric-edit-payload.schema.ts` — export `MetricEditPayloadSchema = z.object({ tileId: z.string(), newValue: z.string() })`; no `.default()` required (event payload); do NOT export any inferred type — consumers declare `type MetricEditPayload = z.infer<typeof MetricEditPayloadSchema>` locally at the import site

### Type Schema Creation — composite types (after leaf schemas exist)

- [x] T054 [US4] [ZOD] Create `src/lib/schemas/ai-review.schema.ts` — depends on T049 (RiskFlagSchema); export `AIReviewSchema` with `grade: z.string()`, `confidence: z.enum(['high', 'medium', 'low'])`, `riskFlags: z.array(RiskFlagSchema)`; do NOT export any inferred type
- [x] T055 [US4] [ZOD] Create `src/lib/schemas/backtest-result.schema.ts` — depends on T038, T039 (TimeSeriesPoint, MonthlyReturn); export `BacktestResultSchema` with all 12 fields using `z.array(TimeSeriesPointSchema)` for curve fields and `z.array(MonthlyReturnSchema)` for monthlyReturns; do NOT export any inferred type

### Type Schema Barrel

- [x] T056 [US4] Update `src/lib/schemas/index.ts` to also re-export all 21 data-contract schema constants (satisfies SC-006); barrel exports schema constants only — no `export type` re-exports; verify zero TypeScript errors; T082, T083, T084 schemas must be added to this barrel

### Organism Schema Migration (FR-012) — after T040–T043 exist

- [x] T057 [P] [US4] Update `src/lib/schemas/ai-chat-panel.schema.ts` — replace `z.custom<ChatMessage[]>()` with `z.array(ChatMessageSchema)` (import from `$lib/schemas`); update `AIChatPanelSchema` definition
- [x] T058 [P] [US4] Update `src/lib/schemas/performance-metric-grid.schema.ts` — replace `z.custom<MetricTile[]>()` with `z.array(MetricTileSchema)`
- [x] T059 [P] [US4] Update `src/lib/schemas/function-gateways.schema.ts` — replace `z.custom<FunctionGatewayCard[]>()` with `z.array(FunctionGatewayCardSchema)`
- [x] T060 [P] [US4] Update `src/lib/schemas/main-menu-group.schema.ts` — replace `z.custom<NavSection[]>()` with `z.array(NavSectionSchema)`
- [x] T061 [P] [US4] Update `src/lib/schemas/result-menu-group.schema.ts` — replace `z.custom<NavSection[]>()` with `z.array(NavSectionSchema)`

### AIReviewPanel Schema & Component Wiring — after T054 (AIReviewSchema) exists

- [x] T070 [US4] Update `src/lib/schemas/ai-review-panel.schema.ts` — depends on T054; replace `z.object({})` with `z.object({ review: AIReviewSchema.default({ grade: '', confidence: 'low', riskFlags: [] }) })`; import `AIReviewSchema` from `$lib/schemas`; do NOT export any inferred type — consumers declare `type State = z.infer<typeof AIReviewPanelSchema>` locally; `review` is non-nullable so `state.review.confidence` requires no optional chaining
- [x] T071 [US4] Update `src/lib/components/organisms/AIReviewPanel.svelte` — depends on T070; add `import { AIReviewPanelSchema } from '$lib/schemas'`; initialize `let state = $state(AIReviewPanelSchema.parse({}))`; assign `state.review = sampleAIReview`; update template references from `sampleAIReview.X` to `state.review.X` with no optional chaining

### DashboardMetricGrid Schema Migration & Wiring — after T044 (MarketMetricSchema) exists

- [x] T074 [P] [US4] Update `src/lib/schemas/dashboard-metric-grid.schema.ts` — depends on T044; replace `z.custom<MarketMetric[]>()` with `z.array(MarketMetricSchema)`; import `MarketMetricSchema` from `$lib/schemas`; do NOT export any inferred type — consumers declare `type State = z.infer<typeof DashboardMetricGridSchema>` locally
- [x] T072 [US4] Update `src/lib/components/organisms/DashboardMetricGrid.svelte` — depends on T015; add `import { DashboardMetricGridSchema } from '$lib/schemas'`; initialize `let state = $state(DashboardMetricGridSchema.parse({}))`; assign `state.metrics = sampleMarketMetrics`; update template reference from `sampleMarketMetrics` to `state.metrics`

### ResourceCostPanel Schema Migration & Wiring — after T050 (ResourceUsageSchema) exists

- [x] T075 [P] [US4] Update `src/lib/schemas/resource-cost-panel.schema.ts` — depends on T050; replace `z.custom<ResourceUsage>()` with `ResourceUsageSchema`; import `ResourceUsageSchema` from `$lib/schemas`; retain `.default({...})` on the field; do NOT export any inferred type — consumers declare `type State = z.infer<typeof ResourceCostPanelSchema>` locally
- [x] T073 [US4] Update `src/lib/components/organisms/ResourceCostPanel.svelte` — depends on T019; add `import { ResourceCostPanelSchema } from '$lib/schemas'`; initialize `let state = $state(ResourceCostPanelSchema.parse({}))`; assign `state.resourceUsage = sampleResourceUsage`; update all template references from `sampleResourceUsage.X` to `state.resourceUsage.X`

**Checkpoint**: US4 complete — 21 type schema files in `src/lib/schemas/` (including T082, T083, T084), all organism `z.custom<T[]>()` replaced, `AIReviewPanel`, `DashboardMetricGrid`, and `ResourceCostPanel` wired to schema state, SC-006 satisfied

---

## Phase 7: User Story 5 — Zod Schemas for Global State Singletons (Priority: P5)

**Goal**: Each global state singleton class (`AppState`, `BacktestState`, `StrategyState`) derives its default values from a Zod schema. Hardcoded defaults in class bodies are removed.

**Independent Test**: `AppStateSchema.parse({})` returns `{ currentLocale: 'en', backtestPrefillSymbol: '', simulatedMetrics: { totalReturn: '42.8', maxDrawdown: '-18.2', winRate: '58.3' } }`. `BacktestStateSchema.safeParse({ mode: 'InvalidMode' })` returns `{ success: false }`.

### State Schema Creation (run in parallel — independent files)

- [x] T062 [P] [US5] [ZOD] Create `src/lib/schemas/app-state.schema.ts` — export `AppStateSchema = z.object({ currentLocale: z.enum(['en', 'zh-TW']).default('en'), backtestPrefillSymbol: z.string().default(''), simulatedMetrics: z.object({ totalReturn: z.string().default('42.8'), maxDrawdown: z.string().default('-18.2'), winRate: z.string().default('58.3') }) })`; do NOT export any inferred type
- [x] T063 [P] [US5] [ZOD] Create `src/lib/schemas/backtest-state.schema.ts` — export `BacktestStateSchema` with `mode: z.enum([...BacktestMode values]).default('Single Stock')`, `initialCapital: z.string().default('100000')`, `startDate: z.string().default('2020-01-01')`, `endDate: z.string().default('2024-12-31')`, `universe: z.string().default('SPY')`, `timeframe: z.string().default('Daily')`, `direction: z.enum(['Long', 'Short', 'Both']).default('Long')`, `selectedOrderTypes: z.array(z.enum([...OrderType values])).default(['Market'])` (FR-014); do NOT export any inferred type
- [x] T064 [P] [US5] [ZOD] Create `src/lib/schemas/strategy-state.schema.ts` — depends on T048 (StrategySchema); export `StrategyStateSchema = z.object({ inputText: z.string().default(''), parsedStrategy: StrategySchema.nullable().default(null) })`; do NOT export any inferred type

### State Schema Barrel

- [x] T065 [US5] Update `src/lib/schemas/index.ts` to also re-export `AppStateSchema`, `BacktestStateSchema`, `StrategyStateSchema` (schema constants only — no inferred type re-exports)

### State Class Updates (each depends on its schema)

- [x] T066 [US5] Update `src/lib/state/app.svelte.ts` — import `AppStateSchema` from `$lib/schemas`; replace each hardcoded class-property default with `AppStateSchema.parse({}).fieldName`; remove any duplicate literal values from the class body
- [x] T067 [US5] Update `src/lib/state/backtest.svelte.ts` — import `BacktestStateSchema` from `$lib/schemas`; replace hardcoded defaults in class properties and `reset()` method with schema-derived values; initialize `selectedOrderTypes` as `new SvelteSet(BacktestStateSchema.parse({}).selectedOrderTypes)` (FR-014)
- [x] T068 [US5] Update `src/lib/state/strategy.svelte.ts` — import `StrategyStateSchema` from `$lib/schemas`; replace hardcoded defaults with `StrategyStateSchema.parse({}).fieldName`

### Unit Tests for State Schemas

- [x] T069 [P] [US5] Create `src/lib/schemas/__tests__/state-schemas.schema.test.ts` — test: `AppStateSchema.parse({})` returns expected defaults; test: `BacktestStateSchema.safeParse({ mode: 'InvalidMode' })` returns `{ success: false }`; test: `StrategyStateSchema.parse({})` returns `{ inputText: '', parsedStrategy: null }`; test: `BacktestStateSchema.parse({}).selectedOrderTypes` equals `['Market']` (SC-007)

**Checkpoint**: US5 complete — 3 state schemas created, 3 state classes updated to use schema defaults, SC-007 satisfied

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation that all success criteria are met

- [x] T080 Remove all `export type` declarations from every `.schema.ts` file — run `grep -rn "^export type" src/lib/schemas --include="*.ts"` and delete each matching line; also remove `export type { ... }` lines from `src/lib/schemas/index.ts` and `src/lib/schemas/index.ts` barrels; run `pnpm check` to confirm zero TypeScript errors (satisfies SC-003)
- [x] T031a [US3] Run `pnpm test:unit` and confirm all schema tests in `src/lib/schemas/__tests__/` pass (includes state schema tests from T069)
- [x] T032 Run `pnpm check` to verify TypeScript compilation passes with zero type errors across all updated organism components, new schema files, and updated state classes (SC-003)
- [x] T033 [P] Run `pnpm lint` to verify prettier + ESLint formatting compliance on all new `.schema.ts` files and updated `.svelte`/`.ts` files
- [x] T034 [P] Verify SC-004 (revised): confirm state singletons import only from `$lib/schemas` and no hardcoded default literals remain in class bodies; confirm organism schemas do not capture global state fields (FR-005)
- [x] T035 [P] Verify `ci-sca` job exists in `.github/workflows/ci.yaml` and is triggered on PR to main — no CRITICAL findings; HIGH requires approved waiver (Constitution Rule 7)
- [x] T036 [P] Verify `ci-secrets-scan` job exists in `.github/workflows/ci.yaml` and is triggered on PR to main — any finding blocks merge with no waiver permitted (Constitution Rule 7)
- [x] T085 [FR-015] Delete `src/lib/types/index.ts` — all 3 remaining interfaces (`BacktestParams`, `UsageMetric`, `MetricEditPayload`) have Zod schema equivalents; zero files import from `$lib/types`; run `pnpm check` to confirm 0 errors (satisfies SC-008)
- [x] T086 [P] [FR-016] Verify SC-009: run `grep -rn "from '\$lib/schemas'" src/lib/schemas/ --include='*.ts'` — confirm zero matches; all intra-schema imports use direct relative paths (e.g., `'./strategy.schema'`); if any match is found, update the offending import to the direct relative path and re-run `pnpm check` to confirm zero TypeScript errors
- [x] T087 Update `src/lib/schemas/live-control-form.schema.ts` — replace `z.object({})` with `z.object({ totalReturn: z.string().default('42.8'), maxDrawdown: z.string().default('-18.2'), winRate: z.string().default('58.3') })`
- [x] T088 Update `src/lib/components/organisms/LiveControlForm.svelte` — remove `appState` import; add `import { LiveControlFormSchema } from '$lib/schemas'`; add `type State = z.infer<typeof LiveControlFormSchema>; let state = $state<State>(LiveControlFormSchema.parse({}))`; update `bind:value` from `appState.simulatedMetrics.totalReturn/maxDrawdown/winRate` to `state.totalReturn/maxDrawdown/winRate`
- [x] T089 [P] Update `src/lib/schemas/app-state.schema.ts` — remove the `simulatedMetrics` nested object from `AppStateSchema`; keep `currentLocale` and `backtestPrefillSymbol` only
- [x] T090 Update `src/lib/state/app.svelte.ts` — remove `simulatedMetrics = $state(_defaults.simulatedMetrics)` from `AppState` class (after T089 removes it from schema)
- [x] T091 Update `src/lib/schemas/__tests__/state-schemas.schema.test.ts` — update `AppStateSchema.parse({})` assertion to `{ currentLocale: 'en', backtestPrefillSymbol: '' }` (no `simulatedMetrics`); add `LiveControlFormSchema` import and a `describe('LiveControlFormSchema')` block testing `parse({})` returns `{ totalReturn: '42.8', maxDrawdown: '-18.2', winRate: '58.3' }`
- [x] T092 [P] Update `src/lib/schemas/app-state.schema.ts` — remove `LocaleSchema` export and `currentLocale` field from `AppStateSchema`; schema becomes `z.object({ backtestPrefillSymbol: z.string().default('') })`
- [x] T093 Update `src/lib/state/app.svelte.ts` — remove `currentLocale = $state(_defaults.currentLocale)` from `AppState` class (after T092 removes it from schema)
- [x] T094 Update `src/lib/components/organisms/TopBar.svelte` — remove `appState` import; add `import { getLocale, setLocale } from '$lib/paraglide/runtime'`; replace `appState.currentLocale === 'en'` display check with `getLocale() === 'en'`; remove `appState.currentLocale = newLocale` mutation (keep `setLocale(newLocale)` only)
- [x] T095 Update `src/lib/schemas/__tests__/state-schemas.schema.test.ts` — update `AppStateSchema.parse({})` assertion to `{ backtestPrefillSymbol: '' }` (no `currentLocale`); remove `rejects invalid locale` test case

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
4. Phase 6 (US4) → 21 data-type schemas (T082–T084 added), FR-012 organism migrations, SC-006 satisfied
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
- `StrategyStateSchema` imports `StrategySchema` from `$lib/schemas` — Phase 7 depends on Phase 6 completing T048
