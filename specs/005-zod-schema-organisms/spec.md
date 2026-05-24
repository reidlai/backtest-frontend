# Feature Specification: Zod Schema per Organism

**Feature Branch**: `005-zod-schema-organisms`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "Create Zod Schema in lib/schemas per each organisms in lib/components/organisms. Currently each organisms maintain state per each required attributes. So I prefer put all these attributes in each organism in single zod schema and then use state to manatain each organism state"

## Clarifications

### Session 2026-05-24

- Q: Which organisms should receive a Zod schema? → A: All organisms (all 16), including stateless/static ones
- Q: For organisms using shared global state, should the schema also capture global state fields they consume? → A: Schema defines only the organism's own local attributes; global state stays in existing singletons
- Q: What is the primary purpose of the Zod schemas? → A: Both runtime validation and TypeScript type inference via `z.infer`
- Q: How should schema files be organized under `src/lib/schemas/`? → A: One file per organism, named to match the organism (e.g., `performance-metric-grid.schema.ts`)
- Q: Should Zod schemas include `.default()` values to serve as initial state? → A: Yes — embed `.default()` on each field so the schema defines both shape and initial values

### Session 2026-05-24 (continued)

- Q: For fields typed with existing TypeScript interfaces (MetricTile, ChatMessage, NavSection), how should nested types be handled in Zod schemas? → A: Use `z.custom<ExistingType>()` to reference existing interfaces — no new nested schemas created
- Q: For `StubSection` (props-based organism), how should its schema be applied? → A: Type inference only — `z.infer<typeof StubSectionSchema>` as the `$props()` type annotation; no runtime `.parse()` on props
- Q: How should the schema be wired into organisms with local `$state`? → A: Consolidate into one state object: `let state = $state(Schema.parse({}))` — replaces all individual `$state` vars with a single schema-typed object
- Q: How should handler functions mutate the consolidated state object? → A: Direct property assignment — `state.tiles = newTiles`, `state.draggedIndex = null`; Svelte 5 `$state` tracks nested property assignments reactively

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Organism State via Zod Schema (Priority: P1)

As a developer, I want each organism to derive its local state shape and initial values from a single Zod schema so that there is one source of truth for each organism's state definition.

**Why this priority**: This is the core deliverable. All other stories depend on schemas existing first.

**Independent Test**: Can be fully tested by verifying that `schema.parse({})` returns a valid default state object for each organism, and that the Svelte component's `$state` variable is typed via `z.infer<typeof Schema>`.

**Acceptance Scenarios**:

1. **Given** an organism with local `$state` variables, **When** the schema is defined with `.default()` on each field, **Then** `schema.parse({})` returns an object matching the current hardcoded defaults
2. **Given** the schema is defined, **When** a developer reads the component, **Then** the `$state` variable type is derived from `z.infer<typeof Schema>` with no separate `type`/`interface` declaration needed

---

### User Story 2 - Schema Files Created for All Organisms (Priority: P2)

As a developer, I want a schema file to exist for every organism (including stateless ones) so that the schema layer is complete and consistent across the atomic design system.

**Why this priority**: Consistency across all organisms avoids partial coverage and future confusion about which organisms have schemas.

**Independent Test**: Can be fully tested by verifying that `src/lib/schemas/` contains one `.schema.ts` file per organism file in `src/lib/components/organisms/`.

**Acceptance Scenarios**:

1. **Given** 16 organism `.svelte` files exist, **When** the feature is implemented, **Then** exactly 16 corresponding `.schema.ts` files exist under `src/lib/schemas/`
2. **Given** a stateless organism (e.g., `NavigationSidebar`), **When** its schema file is created, **Then** the schema exports an empty object schema `z.object({})` as a valid placeholder

---

### User Story 3 - Runtime Validation on State Initialization (Priority: P3)

As a developer, I want organism state to be validated against the schema at initialization so that invalid or malformed state is caught at runtime rather than silently propagating.

**Why this priority**: Validation is a secondary benefit; correct typing (P1) and full coverage (P2) must ship first.

**Independent Test**: Can be fully tested by passing an invalid value to `schema.safeParse()` and confirming it returns `success: false` with an appropriate error.

**Acceptance Scenarios**:

1. **Given** an organism schema with a typed field, **When** `schema.safeParse()` is called with a value of the wrong type, **Then** it returns `{ success: false }` with a descriptive error
2. **Given** `schema.parse({})` is called with no arguments, **When** all fields have `.default()` defined, **Then** it returns a fully valid default state object without throwing

---

### User Story 4 - Zod Schemas for All Data-Contract Types (Priority: P4)

As a developer, I want every TypeScript interface in `src/lib/types/index.ts` that appears in `src/lib/data/` or is consumed by organism schemas to have a native Zod schema under `src/lib/schemas/types/` so that item-level runtime validation and contract generation (Constitution Rule 12 step 5) are possible.

**Why this priority**: Enables replacing `z.custom<T[]>()` in organism schemas with `z.array(TypeSchema)` — unlocking per-item validation. Also satisfies the "data contract" clause of Constitution Rule 12.

**Independent Test**: Count files in `src/lib/schemas/types/` — expect exactly 18 `.schema.ts` files + 1 `index.ts`. Confirm `MetricTileSchema.safeParse({ id: 1 })` returns `{ success: false }` (type error on numeric id).

**Acceptance Scenarios**:

1. **Given** a TypeScript interface (e.g., `MarketMetric`) in `lib/types/index.ts`, **When** its Zod schema is created, **Then** `MarketMetricSchema.parse(sampleMarketMetrics[0])` succeeds and `z.infer<typeof MarketMetricSchema>` matches the interface shape
2. **Given** data-type schemas exist, **When** organism schemas are updated, **Then** `AIChatPanelSchema` uses `z.array(ChatMessageSchema)` and `safeParse({ messages: [{ id: 1 }] })` returns `{ success: false }`

---

### User Story 5 - Zod Schemas for Global State Singletons (Priority: P5)

As a developer, I want each global state singleton (`appState`, `backtestState`, `strategyState`) to derive its default values from a Zod schema so that state initialization is validated and the schema serves as the single source of truth for default values.

**Why this priority**: Completes the "every state" coverage required by Constitution Rule 12 step 4. State singletons currently use hardcoded defaults scattered across the class body.

**Independent Test**: Confirm `BacktestStateSchema.parse({})` returns `{ mode: 'Single Stock', initialCapital: '100000', ... }` and `BacktestStateSchema.safeParse({ mode: 'InvalidMode' })` returns `{ success: false }`.

**Acceptance Scenarios**:

1. **Given** a state singleton class (e.g., `BacktestState`), **When** its Zod schema is defined, **Then** class properties are initialized via `Schema.parse({}).fieldName` and the hardcoded defaults are removed from the class body
2. **Given** `BacktestState.selectedOrderTypes` is a `SvelteSet<OrderType>`, **When** the schema represents it as `z.array(z.enum([...]))`, **Then** the class initializes `new SvelteSet(BacktestStateSchema.parse({}).selectedOrderTypes)`

---

### Edge Cases

- What happens when an organism has only `$props()` (e.g., `StubSection`)? Schema should reflect props shape, not state.
- How should organisms with `SvelteSet` state (e.g., `backtestState.selectedOrderTypes`) be represented? `SvelteSet` is not a plain value — schema can use `z.array()` as the serializable equivalent.
- Organisms with `const` static data (e.g., `FunctionGateways.gatewayCards`, `MainMenuGroup.mainSections`) that is never mutated — these MUST still use `let state = $state(Schema.parse({}))` per FR-004; the `const` array is assigned to `state.field` immediately after parse, consistent with the display-data pattern used by `DashboardMetricGrid` and `ResourceCostPanel`. The schema's `default([])` is the uninitialized default; the component populates it.
- `samplePerfSummary` in `src/lib/data/performance.ts` is an inferred `{ label: string; value: string }[]` with no named interface. A `PerfSummaryItem` interface must be added to `lib/types/index.ts` before its schema can be created.
- `StrategyState.parsedStrategy: Strategy | null` requires `StrategySchema.nullable().default(null)` — the nullable complex-type pattern must reference the data-type schema for `Strategy`.
- `z.custom<T>()` bypasses item-level Zod validation; once data-type schemas exist, organism schemas must migrate to `z.array(TypeSchema)` to achieve true runtime validation on array contents.
- `AIReviewPanel` renders `sampleAIReview` (grade, confidence, riskFlags) imported from `$lib/data/strategy` — this data is organism-level display state, not a global singleton. Keep `review` as the wrapper field but make it **non-nullable** with a default: `AIReviewSchema.default({ grade: '', confidence: 'low', riskFlags: [] })`. This ensures `state.review.confidence` is always a typed string with no optional chaining. Contrast with `StrategyState.parsedStrategy` which uses `.nullable().default(null)` because a parsed strategy may genuinely be absent.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST create one Zod schema file per organism under `src/lib/schemas/`, named `<organism-kebab-case>.schema.ts`
- **FR-002**: Each schema file MUST export a named Zod schema (e.g., `export const PerformanceMetricGridSchema = z.object({...})`)
- **FR-003**: Each schema MUST include `.default()` values on all fields, matching the current hardcoded defaults in the organism or state class
- **FR-004**: Each organism's local state MUST be consolidated into a single `let state = $state(Schema.parse({}))` declaration typed via `z.infer<typeof Schema>` — individual scattered `$state` variables are replaced
- **FR-004a**: All Svelte template references to former individual `$state` vars (e.g., `tiles`, `draggedIndex`) MUST be updated to `state.tiles`, `state.draggedIndex`, etc.
- **FR-005**: Schemas MUST cover only the organism's own local attributes; existing global state singletons (`appState`, `backtestState`, `strategyState`) MUST NOT be duplicated into organism schemas
- **FR-006**: Stateless organisms MUST receive an empty placeholder schema (`z.object({})`) to ensure full coverage
- **FR-007**: Each schema MUST be usable for both runtime validation (`.parse()` / `.safeParse()`) and TypeScript type inference (`z.infer`)
- **FR-008**: An `index.ts` barrel file MUST be created at `src/lib/schemas/index.ts` re-exporting all organism schemas
- **FR-009**: Fields typed with existing TypeScript interfaces MUST use `z.custom<ExistingType>()` as an **interim** strategy while data-type schemas are absent; once `src/lib/schemas/types/` schemas exist for those types (FR-011), organism schemas MUST be updated to replace `z.custom<T[]>()` with `z.array(TypeSchema)` to enable item-level runtime validation (FR-012)
- **FR-010**: Handler functions MUST mutate state via direct property assignment (`state.field = value`); whole-object replacement (`state = { ...state }`) MUST NOT be used
- **FR-011**: All TypeScript interfaces in `src/lib/types/index.ts` that appear in `src/lib/data/` modules, plus `NavSection`, `ChatMessage`, and `FunctionGatewayCard` consumed by organism schemas, MUST have a Zod schema file under `src/lib/schemas/types/`, named `<kebab-case>.schema.ts`; the `PerfSummaryItem` interface MUST be added to `lib/types/index.ts` before its schema is created (18 schema files total)
- **FR-012**: After `src/lib/schemas/types/` schemas exist, organism schemas using `z.custom<T[]>()` for `MetricTile`, `ChatMessage`, `NavSection`, and `FunctionGatewayCard` MUST be updated to `z.array(TypeSchema)` — 5 schema files affected
- **FR-013**: Global state singletons (`AppState`, `BacktestState`, `StrategyState`) MUST each have a Zod schema under `src/lib/schemas/state/`, named `<kebab-case>-state.schema.ts`; class properties are initialized from `Schema.parse({}).fieldName` defaults, replacing hardcoded default values in class bodies
- **FR-014**: `BacktestState.selectedOrderTypes` (`SvelteSet<OrderType>`) MUST be represented in its schema as `z.array(z.enum([...OrderType values])).default(['Market'])`; the class reconstructs the `SvelteSet` from the parsed array: `new SvelteSet(BacktestStateSchema.parse({}).selectedOrderTypes)`

### Key Entities _(include if feature involves data)_

Organisms and their local state (to be captured in Zod schemas):

| Organism | Local State Fields | Notes |
|---|---|---|
| `AIChatPanel` | `chatInput: string`, `messages: ChatMessage[]` | `messages` field uses `z.custom<ChatMessage[]>()` |
| `AIResearchBox` | `aiText: string`, `validationError: boolean` | Also reads `strategyState` (excluded from schema) |
| `AIReviewPanel` | `review: AIReview` | Non-nullable; `AIReviewSchema.default({ grade: '', confidence: 'low', riskFlags: [] })`; initialized via `state.review = sampleAIReview` |
| `AIReviewSidebar` | _(none)_ | Empty schema |
| `DashboardMetricGrid` | `metrics: MarketMetric[]` | Display data from `$lib/data/market`; uses `z.custom<MarketMetric[]>().default([])` initially, migrates to `z.array(MarketMetricSchema)` in Phase 6; initialized via `state.metrics = sampleMarketMetrics` |
| `FunctionGateways` | `gatewayCards: FunctionGatewayCard[]` | Static `const`; schema uses `z.array(FunctionGatewayCardSchema)` (FR-012 migration done); initialized via `state.gatewayCards = [...]` |
| `LiveControlForm` | _(none — reads appState)_ | Empty schema |
| `MainMenuGroup` | `mainSections: NavSection[]` | Static `const`; schema uses `z.array(NavSectionSchema)` (FR-012 migration done); initialized via `state.mainSections = [...]` |
| `NavigationSidebar` | _(none)_ | Empty schema |
| `PerformancdeChartTabs` | `activeChartTab: ChartTab` | `ChartTab` is a union literal; use `z.enum(['equity-curve', 'drawdown', 'benchmark-overlay', 'monthly-heatmap'])` for full runtime validation (see research.md Decision 3) |
| `PerformanceMetricGrid` | `tiles: MetricTile[]`, `draggedIndex: number\|null`, `editingTileId: string\|null`, `editValue: string`, `modalOpen: boolean` | `tiles` uses `z.custom<MetricTile[]>()`; primitives use native Zod types |
| `QuickActionsPanel` | _(none — reads global state; uses `sampleTrades` only in CSV export handler, not display state)_ | Empty schema |
| `ResourceCostPanel` | `resourceUsage: ResourceUsage` | Display data from `$lib/data/strategy`; uses `z.custom<ResourceUsage>().default({ tokensUsed: 4250, tokensTotal: 10000, backtestsUsed: 3, backtestsTotal: 10, queuePosition: 0, estimatedRuntime: '~42s', complexityScore: 67, planImpact: 'medium' })` initially, migrates to `ResourceUsageSchema.default({...})` in Phase 6; initialized via `state.resourceUsage = sampleResourceUsage` |
| `ResultMenuGroup` | `resultSections: NavSection[]` | Static `const`; schema uses `z.array(NavSectionSchema)` (FR-012 migration done); initialized via `state.resultSections = [...]` |
| `StubSection` | `title: string` (prop) | Props-based; schema used for type inference only (`z.infer` as `$props()` type), no runtime `.parse()` |
| `TopBar` | _(none — reads global state)_ | Empty schema |

### Data-Contract Types (FR-011 — `src/lib/schemas/types/`)

| Interface | Source File | Notes |
|---|---|---|
| `TimeSeriesPoint` | `types/index.ts` | Leaf type; nested in `BacktestResult` |
| `MonthlyReturn` | `types/index.ts` | Leaf type; nested in `BacktestResult` |
| `MetricTile` | `types/index.ts` | Currently `z.custom` in organism schema — will migrate to `z.array(MetricTileSchema)` |
| `NavSection` | `types/index.ts` | Used in `MainMenuGroup`, `ResultMenuGroup` organisms; inline `SectionId`/`NavGroup` enums |
| `ChatMessage` | `types/index.ts` | Used in `AIChatPanel` organism |
| `FunctionGatewayCard` | `types/index.ts` | Used in `FunctionGateways` organism; inline `SectionId` enum |
| `MarketMetric` | `types/index.ts` | Inline `MetricCategory` enum |
| `MarketRegime` | `types/index.ts` | Inline `RegimeStatus` enum |
| `ScreenerResult` | `types/index.ts` | Leaf type |
| `BacktestResult` | `types/index.ts` | Refs `TimeSeriesPointSchema`, `MonthlyReturnSchema` |
| `RegimeBreakdown` | `types/index.ts` | Leaf type |
| `PerfSummaryItem` | `types/index.ts` _(add)_ | `{ label: string; value: string }` — must be added to `lib/types/index.ts` first |
| `Strategy` | `types/index.ts` | Leaf type; referenced by `StrategyStateSchema` |
| `RiskFlag` | `types/index.ts` | Inline `FlagSeverity` enum; nested in `AIReview` |
| `AIReview` | `types/index.ts` | Refs `RiskFlagSchema`; inline `ConfidenceLevel` enum |
| `ResourceUsage` | `types/index.ts` | Inline `PlanImpact` enum |
| `TradeRecord` | `types/index.ts` | Inline `TradeDirection` enum |
| `SentimentEvent` | `types/index.ts` | Inline `SentimentEventType`, `Sentiment` enums |

### State Singletons (FR-013 — `src/lib/schemas/state/`)

| Singleton | Fields | Notes |
|---|---|---|
| `AppState` | `currentLocale: Locale`, `backtestPrefillSymbol: string`, `simulatedMetrics: { totalReturn, maxDrawdown, winRate }` | `Locale` as `z.enum(['en', 'zh-TW'])` |
| `BacktestState` | `mode: BacktestMode`, `initialCapital: string`, `startDate: string`, `endDate: string`, `universe: string`, `timeframe: string`, `direction: 'Long'\|'Short'\|'Both'`, `selectedOrderTypes: SvelteSet<OrderType>` | `selectedOrderTypes` represented as `z.array(z.enum([...]))` per FR-014 |
| `StrategyState` | `inputText: string`, `parsedStrategy: Strategy\|null` | Uses `StrategySchema.nullable().default(null)` |

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Exactly 16 `.schema.ts` files exist under `src/lib/schemas/` — one per organism
- **SC-002**: `schema.parse({})` succeeds for every organism schema (all fields have defaults)
- **SC-003**: TypeScript compilation passes with zero type errors after replacing hand-written types with `z.infer` derivations
- **SC-004**: No existing global state singleton (`appState`, `backtestState`, `strategyState`) is modified or removed
- **SC-005**: All organism schemas are re-exported from `src/lib/schemas/index.ts`
- **SC-006**: Exactly 18 `.schema.ts` files exist under `src/lib/schemas/types/` — one per data-contract interface — and `src/lib/schemas/types/index.ts` barrel exports all of them
- **SC-007**: `AppStateSchema.parse({})`, `BacktestStateSchema.parse({})`, and `StrategyStateSchema.parse({})` each succeed and return objects with their expected default values; `BacktestStateSchema.safeParse({ mode: 'InvalidMode' })` returns `{ success: false }`

## Assumptions

- The `zod` package is NOT currently in `package.json` and MUST be added as a dependency in this feature
- `src/lib/schemas/` directory does not yet exist and will be created as part of this feature
- `SvelteSet` fields (e.g., `selectedOrderTypes` in `backtestState`) are serialised as `z.array()` in state schemas (FR-014) and reconstructed via `new SvelteSet(...)` in class initializers — they are not organism-local state (FR-005)
- Organisms with only static `const` data (never mutated) will have schemas representing the data shape but the `const` declaration will not be changed to reactive `$state`
- The `StubSection` organism's `title` prop will be represented in the schema as a prop shape, not local state
