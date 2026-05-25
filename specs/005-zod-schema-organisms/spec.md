# Feature Specification: Zod Schema per Organism

**Feature Branch**: `005-zod-schema-organisms`

**Created**: 2026-05-24

**Status**: Implemented

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

### Session 2026-05-25

- Q: Should FR-012 be expanded to cover all `z.custom` replacements in organism schemas (including `DashboardMetricGrid` and `ResourceCostPanel`), not just the 5 type-array migrations originally listed? → A: Yes — FR-012 covers all 7 `z.custom` eliminations across organism schemas; the verifiable criterion is zero remaining `z.custom` calls in any organism schema file once all data-type schemas exist
- Q: Should the spec explicitly mark contract generation (Constitution Rule 12 step 5 — OpenAPI/Swagger and API client generation from Zod schemas) as out of scope for this feature? → A: Yes — contract generation is explicitly deferred to a subsequent feature branch
- Q: When one schema file imports another (e.g., `strategy-state.schema.ts` importing `StrategySchema`), should it use a direct relative path or the barrel (`$lib/schemas`)? → A: Direct relative paths only — the barrel is for external consumers (components, state classes, tests); intra-schema imports MUST use relative paths to prevent circular imports
- Q: Should SC-009 be added to make FR-016 (intra-schema import convention) verifiable? → A: Yes — SC-009 added: no file inside `src/lib/schemas/` imports from the barrel; `grep -rn "from '\$lib/schemas'" src/lib/schemas/ --include='*.ts'` returns zero matches
- Q: Should the 4 Key Entities rows with stale interim `z.custom` notes (AIChatPanel, PerformanceMetricGrid, DashboardMetricGrid, ResourceCostPanel) be updated to reflect the final post-FR-012-migration schema types? → A: Yes — update all 4 rows to show final state; migration history belongs in git log, not the spec table
- Q: Should the spec Status be updated from "Draft" to "Implemented" and the two now-false Assumptions ("zod NOT in package.json", "src/lib/schemas/ does not exist") be corrected to past tense? → A: Yes — Status updated to Implemented; assumptions reworded to reflect completed state
- Q: Should the US4 Independent Test count be corrected from "exactly 18" to "exactly 21" data-contract schema files to match FR-011 (which defines 21 schemas)? → A: Yes — update to 21
- Q: Should the Edge Cases bullet describing `z.custom<T>()` migration as a future action be rewritten to confirm it is complete? → A: Yes — rewrite as completed fact; all 7 organism schema migrations are done per FR-012

### Session 2026-05-25 (continued)

- Q: `LiveControlForm` currently reads `appState.simulatedMetrics.*` via `bind:value`. Should it move to local schema state, and what happens to `appState.simulatedMetrics`? → A: `LiveControlForm` gets its own local Zod schema and `$state`; `simulatedMetrics` is removed from `AppState`/`AppStateSchema` entirely; state propagation to other organisms or API is deferred to a future feature
- Q: Should `LiveControlFormSchema` use flat root fields or nest them under `simulatedMetrics`? → A: Flat root fields — `totalReturn`, `maxDrawdown`, `winRate` at schema root; template uses `state.totalReturn` etc.; consistent with all other organism schemas
- Q: Should `simulatedMetrics` be removed from `app-state.schema.ts` and `AppState` class in this branch, or deferred? → A: Remove in this branch — `app-state.schema.ts` updated to `{ currentLocale, backtestPrefillSymbol }` only; `AppState` class updated accordingly; no dead state left in the singleton
- Q: `AppState` contains `currentLocale` which Paraglide already manages via `getLocale()`/`setLocale()`; should `currentLocale` be removed from `AppStateSchema` and `AppState`, with `TopBar.svelte` updated to use `getLocale()` directly? → A: Yes — remove `currentLocale` and `LocaleSchema` from `app-state.schema.ts`; remove `currentLocale` from `AppState` class; update `TopBar.svelte` to read locale via `getLocale()` from `$lib/paraglide/runtime`; `setLocale()` write call remains unchanged; `LocaleSchema` / `z.enum(['en','zh-TW'])` removed entirely

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

As a developer, I want every TypeScript interface in `src/lib/types/index.ts` that appears in `src/lib/data/` or is consumed by organism schemas to have a native Zod schema directly under `src/lib/schemas/` so that item-level runtime validation and contract generation (Constitution Rule 12 step 5) are possible.

**Why this priority**: Enables replacing `z.custom<T[]>()` in organism schemas with `z.array(TypeSchema)` — unlocking per-item validation. Also satisfies the "data contract" clause of Constitution Rule 12.

**Independent Test**: Count data-contract schema files in `src/lib/schemas/` — expect exactly 21 matching `<data-type>.schema.ts` pattern (excludes organism schemas and state schemas). Confirm `MetricTileSchema.safeParse({ id: 1 })` returns `{ success: false }` (type error on numeric id).

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
- `samplePerfSummary` in `src/lib/data/performance.ts` was an inferred `{ label: string; value: string }[]` with no named interface. A `PerfSummaryItem` interface was added to `lib/types/index.ts` via T037 before its schema was created in T053; `lib/types/index.ts` was subsequently deleted by T085 (FR-015).
- `StrategyState.parsedStrategy: Strategy | null` requires `StrategySchema.nullable().default(null)` — the nullable complex-type pattern must reference the data-type schema for `Strategy`.
- `z.custom<T>()` was used as an interim strategy to bypass item-level Zod validation while data-type schemas were absent; all 7 organism schema migrations to `z.array(TypeSchema)` are complete per FR-012 — no `z.custom` calls remain in organism schemas (verified by SC-009 grep criterion).
- `AIReviewPanel` renders `sampleAIReview` (grade, confidence, riskFlags) imported from `$lib/shared-mockdata/strategy` — this data is organism-level display state, not a global singleton. Keep `review` as the wrapper field but make it **non-nullable** with a default: `AIReviewSchema.default({ grade: '', confidence: 'low', riskFlags: [] })`. This ensures `state.review.confidence` is always a typed string with no optional chaining. Contrast with `StrategyState.parsedStrategy` which uses `.nullable().default(null)` because a parsed strategy may genuinely be absent.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST create one Zod schema file per organism under `src/lib/schemas/`, named `<organism-kebab-case>.schema.ts`
- **FR-002**: Each schema file MUST export a named Zod schema (e.g., `export const PerformanceMetricGridSchema = z.object({...})`); schema files MUST NOT export inferred TypeScript types — `z.infer<typeof Schema>` derivations belong at the consumer site (component, state class, or test file) that imports the schema
- **FR-003**: Each schema MUST include `.default()` values on all fields, matching the current hardcoded defaults in the organism or state class
- **FR-004**: Each organism's local state MUST be consolidated into a single `let state = $state(Schema.parse({}))` declaration; the local type is derived at the component site with `type State = z.infer<typeof Schema>` and MUST NOT be exported from the schema file — individual scattered `$state` variables are replaced
- **FR-004a**: All Svelte template references to former individual `$state` vars (e.g., `tiles`, `draggedIndex`) MUST be updated to `state.tiles`, `state.draggedIndex`, etc.
- **FR-005**: Schemas MUST cover only the organism's own local attributes; existing global state singletons (`appState`, `backtestState`, `strategyState`) MUST NOT be duplicated into organism schemas
- **FR-006**: Stateless organisms MUST receive an empty placeholder schema (`z.object({})`) to ensure full coverage
- **FR-007**: Each schema MUST be usable for both runtime validation (`.parse()` / `.safeParse()`) and TypeScript type inference (`z.infer`)
- **FR-008**: An `index.ts` barrel file MUST be created at `src/lib/schemas/index.ts` re-exporting all organism schemas
- **FR-009**: Fields typed with existing TypeScript interfaces MUST use `z.custom<ExistingType>()` as an **interim** strategy while data-type schemas are absent; once data-type schemas exist under `src/lib/schemas/` (FR-011), organism schemas MUST be updated to replace `z.custom<T[]>()` with `z.array(TypeSchema)` to enable item-level runtime validation (FR-012)
- **FR-010**: Handler functions MUST mutate state via direct property assignment (`state.field = value`); whole-object replacement (`state = { ...state }`) MUST NOT be used
- **FR-011**: All TypeScript interfaces in `src/lib/types/index.ts` that appear in `src/lib/data/` modules, plus `NavSection`, `ChatMessage`, and `FunctionGatewayCard` consumed by organism schemas, plus `BacktestParams`, `UsageMetric`, and `MetricEditPayload`, MUST have a Zod schema file directly under `src/lib/schemas/`, named `<kebab-case>.schema.ts`; the `PerfSummaryItem` interface MUST be added to `lib/types/index.ts` before its schema is created (21 schema files total); no `types/` subdirectory — all schemas live flat at the `src/lib/schemas/` root; `BacktestParams` and `MetricEditPayload` are config/payload types with no `.default()` required — they are used for validation and `z.infer` at consumer sites only
- **FR-012**: After data-type schemas under `src/lib/schemas/` exist, ALL `z.custom<T>()` usages in organism schemas MUST be replaced with their native Zod equivalents — 7 schema files affected: `AIChatPanel` (`ChatMessage[]` → `z.array(ChatMessageSchema)`), `PerformanceMetricGrid` (`MetricTile[]` → `z.array(MetricTileSchema)`), `FunctionGateways` (`FunctionGatewayCard[]` → `z.array(FunctionGatewayCardSchema)`), `MainMenuGroup` (`NavSection[]` → `z.array(NavSectionSchema)`), `ResultMenuGroup` (`NavSection[]` → `z.array(NavSectionSchema)`), `DashboardMetricGrid` (`MarketMetric[]` → `z.array(MarketMetricSchema)`), `ResourceCostPanel` (`ResourceUsage` → `ResourceUsageSchema`); verifiable criterion: `grep -rn "z\.custom" src/lib/schemas/` returns zero matches in organism schema files after completion
- **FR-013**: Global state singletons (`AppState`, `BacktestState`, `StrategyState`) MUST each have a Zod schema directly under `src/lib/schemas/`, named `<kebab-case>-state.schema.ts`; no `state/` subdirectory — all schemas live flat at the `src/lib/schemas/` root; class properties are initialized from `Schema.parse({}).fieldName` defaults, replacing hardcoded default values in class bodies
- **FR-014**: `BacktestState.selectedOrderTypes` (`SvelteSet<OrderType>`) MUST be represented in its schema as `z.array(z.enum([...OrderType values])).default(['Market'])`; the class reconstructs the `SvelteSet` from the parsed array: `new SvelteSet(BacktestStateSchema.parse({}).selectedOrderTypes)`
- **FR-015**: `src/lib/types/index.ts` MUST be deleted once all its interfaces have a Zod schema equivalent under `src/lib/schemas/` and zero source files import from `$lib/types`; consumers derive types locally via `z.infer<typeof XSchema>` — no hand-written interface shims are retained alongside their Zod counterparts
- **FR-016**: Schema files that depend on other schema files MUST import using direct relative paths (e.g., `import { StrategySchema } from './strategy.schema'`); the barrel (`$lib/schemas` / `src/lib/schemas/index.ts`) MUST NOT be used as an import source within `src/lib/schemas/` — it is reserved for external consumers (organism components, state classes, tests) only; this rule prevents circular import errors at build time

### Key Entities _(include if feature involves data)_

Organisms and their local state (to be captured in Zod schemas):

| Organism | Local State Fields | Notes |
|---|---|---|
| `AIChatPanel` | `chatInput: string`, `messages: ChatMessage[]` | `messages` field uses `z.array(ChatMessageSchema)` (FR-012 migration complete) |
| `AIResearchBox` | `aiText: string`, `validationError: boolean` | Also reads `strategyState` (excluded from schema) |
| `AIReviewPanel` | `review: AIReview` | Non-nullable; `AIReviewSchema.default({ grade: '', confidence: 'low', riskFlags: [] })`; initialized via `state.review = sampleAIReview` |
| `AIReviewSidebar` | _(none)_ | Empty schema |
| `DashboardMetricGrid` | `metrics: MarketMetric[]` | Display data from `$lib/shared-mockdata/market`; schema uses `z.array(MarketMetricSchema).default([])` (FR-012 migration complete); initialized via `state.metrics = sampleMarketMetrics` |
| `FunctionGateways` | `gatewayCards: FunctionGatewayCard[]` | Static `const`; schema uses `z.array(FunctionGatewayCardSchema)` (FR-012 migration done); initialized via `state.gatewayCards = [...]` |
| `LiveControlForm` | `totalReturn: string`, `maxDrawdown: string`, `winRate: string` | Previously read `appState.simulatedMetrics`; now owns these fields locally — `LiveControlFormSchema = z.object({ totalReturn: z.string().default('42.8'), maxDrawdown: z.string().default('-18.2'), winRate: z.string().default('58.3') })`; template uses `state.totalReturn` etc.; `appState` import removed; state propagation to other organisms/API deferred to future feature |
| `MainMenuGroup` | `mainSections: NavSection[]` | Static `const`; schema uses `z.array(NavSectionSchema)` (FR-012 migration done); initialized via `state.mainSections = [...]` |
| `NavigationSidebar` | _(none)_ | Empty schema |
| `PerformancdeChartTabs` | `activeChartTab: ChartTab` | `ChartTab` is a union literal; use `z.enum(['equity-curve', 'drawdown', 'benchmark-overlay', 'monthly-heatmap'])` for full runtime validation (see research.md Decision 3) |
| `PerformanceMetricGrid` | `tiles: MetricTile[]`, `draggedIndex: number\|null`, `editingTileId: string\|null`, `editValue: string`, `modalOpen: boolean` | `tiles` uses `z.array(MetricTileSchema)` (FR-012 migration complete); primitives use native Zod types |
| `QuickActionsPanel` | _(none — reads global state; uses `sampleTrades` only in CSV export handler, not display state)_ | Empty schema |
| `ResourceCostPanel` | `resourceUsage: ResourceUsage` | Display data from `$lib/shared-mockdata/strategy`; schema uses `ResourceUsageSchema.default({ tokensUsed: 4250, tokensTotal: 10000, backtestsUsed: 3, backtestsTotal: 10, queuePosition: 0, estimatedRuntime: '~42s', complexityScore: 67, planImpact: 'medium' })` (FR-012 migration complete); initialized via `state.resourceUsage = sampleResourceUsage` |
| `ResultMenuGroup` | `resultSections: NavSection[]` | Static `const`; schema uses `z.array(NavSectionSchema)` (FR-012 migration done); initialized via `state.resultSections = [...]` |
| `StubSection` | `title: string` (prop) | Props-based; schema used for type inference only (`z.infer` as `$props()` type), no runtime `.parse()` |
| `TopBar` | _(none)_ | Empty schema; previously read `appState.currentLocale` — updated to use `getLocale()` from `$lib/paraglide/runtime` directly |

### Data-Contract Types (FR-011 — `src/lib/schemas/` root)

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
| `PerfSummaryItem` | `types/index.ts` *(deleted — interface added via T037, schema created in T053)* | `{ label: string; value: string }` |
| `Strategy` | `types/index.ts` | Leaf type; referenced by `StrategyStateSchema` |
| `RiskFlag` | `types/index.ts` | Inline `FlagSeverity` enum; nested in `AIReview` |
| `AIReview` | `types/index.ts` | Refs `RiskFlagSchema`; inline `ConfidenceLevel` enum |
| `ResourceUsage` | `types/index.ts` | Inline `PlanImpact` enum |
| `TradeRecord` | `types/index.ts` | Inline `TradeDirection` enum |
| `SentimentEvent` | `types/index.ts` | Inline `SentimentEventType`, `Sentiment` enums |
| `BacktestParams` | `types/index.ts` | Config/payload type; no `.default()` required; `mode` as `z.enum([...])`, `orderTypes` as `z.array(z.enum([...]))` |
| `UsageMetric` | `types/index.ts` | Settings/Billing display type; `description` is optional (`z.string().optional()`) |
| `MetricEditPayload` | `types/index.ts` | Edit modal event payload; no `.default()` required |

### State Singletons (FR-013 — `src/lib/schemas/` root)

> **`appState` vs `$app/state`**: SvelteKit's built-in `$app/state` module exposes read-only routing context (`page`, `navigating`, `updated`) — it cannot be written to by application code and resets on navigation. The project's `appState` singleton (`$lib/state/app.svelte.ts`) holds mutable business-domain state (`backtestPrefillSymbol`) that persists across route changes and is driven by user interactions, not the router. They address orthogonal concerns and cannot substitute for each other. Note: `simulatedMetrics` was removed from `AppState` — it is now owned locally by `LiveControlForm`. `currentLocale` was also removed — Paraglide's `getLocale()`/`setLocale()` from `$lib/paraglide/runtime` is the canonical locale source; `TopBar.svelte` reads `getLocale()` directly.

| Singleton | Fields | Notes |
|---|---|---|
| `AppState` | `backtestPrefillSymbol: string` | `currentLocale` removed — Paraglide's `getLocale()`/`setLocale()` (`$lib/paraglide/runtime`) is the canonical locale source; `LocaleSchema` / `z.enum(['en','zh-TW'])` removed from `app-state.schema.ts`; `simulatedMetrics` removed — transferred to `LiveControlForm` local state |
| `BacktestState` | `mode: BacktestMode`, `initialCapital: string`, `startDate: string`, `endDate: string`, `universe: string`, `timeframe: string`, `direction: 'Long'\|'Short'\|'Both'`, `selectedOrderTypes: SvelteSet<OrderType>` | `selectedOrderTypes` represented as `z.array(z.enum([...]))` per FR-014 |
| `StrategyState` | `inputText: string`, `parsedStrategy: Strategy\|null` | Uses `StrategySchema.nullable().default(null)` |

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Exactly 16 `.schema.ts` files exist under `src/lib/schemas/` — one per organism
- **SC-002**: `schema.parse({})` succeeds for every organism schema (all fields have defaults)
- **SC-003**: TypeScript compilation passes with zero type errors; `z.infer<typeof Schema>` derivations appear only at consumer sites (components, state classes, tests); no `export type` statement appears in any `.schema.ts` file
- **SC-004**: `backtestState` and `strategyState` singletons are not modified or removed; `appState` is modified to remove `simulatedMetrics` (transferred to `LiveControlForm` local state) and `currentLocale` (Paraglide's `getLocale()` is the canonical locale source; `TopBar.svelte` updated to call `getLocale()` directly)
- **SC-005**: All organism schemas are re-exported from `src/lib/schemas/index.ts`
- **SC-006**: Exactly 21 data-contract `.schema.ts` files exist directly under `src/lib/schemas/` (not in any subdirectory) — one per data-contract interface — and all are exported from the single `src/lib/schemas/index.ts` barrel
- **SC-007**: `AppStateSchema.parse({})` returns `{ backtestPrefillSymbol: '' }` (no `simulatedMetrics`, no `currentLocale`); `BacktestStateSchema.parse({})` and `StrategyStateSchema.parse({})` each succeed and return objects with their expected default values; `BacktestStateSchema.safeParse({ mode: 'InvalidMode' })` returns `{ success: false }`; `LiveControlFormSchema.parse({})` returns `{ totalReturn: '42.8', maxDrawdown: '-18.2', winRate: '58.3' }`
- **SC-008**: `src/lib/types/index.ts` does not exist in the repository; `grep -r "from '\$lib/types'" src/` returns no matches
- **SC-009**: No `.schema.ts` file within `src/lib/schemas/` imports from the barrel; `grep -rn "from '\$lib/schemas'" src/lib/schemas/ --include='*.ts'` returns zero matches (enforces FR-016 — intra-schema imports MUST use direct relative paths)

## Out of Scope

- **Contract generation** (Constitution Rule 12 step 5): Automatic generation of OpenAPI/Swagger specifications and API clients from Zod schemas is explicitly deferred to a subsequent feature branch. This feature delivers step 4 only — schema creation. Step 5 begins after all schemas under `src/lib/schemas/` are stable.
- **LiveControlForm state propagation**: How `LiveControlForm`'s local `totalReturn`/`maxDrawdown`/`winRate` state is shared with other organisms or sent to an API is deferred to a future feature. In this feature, `handleSimulate` continues to show a toast only.

## Assumptions

- The `zod` package was added as a runtime dependency in `package.json` as part of this feature (T001)
- `src/lib/schemas/` was created as part of this feature (T003); it now contains 40 schema files and one barrel `index.ts`
- `SvelteSet` fields (e.g., `selectedOrderTypes` in `backtestState`) are serialised as `z.array()` in state schemas (FR-014) and reconstructed via `new SvelteSet(...)` in class initializers — they are not organism-local state (FR-005)
- Organisms with only static `const` data (never mutated) will have schemas representing the data shape but the `const` declaration will not be changed to reactive `$state`
- The `StubSection` organism's `title` prop will be represented in the schema as a prop shape, not local state
