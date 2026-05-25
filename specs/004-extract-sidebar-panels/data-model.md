# Data Model: Extract Organisms into Dedicated Components and SvelteKit Routes

**Feature**: `004-extract-sidebar-panels` | **Date**: 2026-05-24

This is a pure structural refactor. The types below represent all entities consumed, owned, or modified by the new organisms and state stores. Two new state store modules are created (`strategy.svelte.ts`, `backtest.svelte.ts`). One existing type is extended (`NavSection` gains a `path` field). No new API surface, Zod schemas, or persistence is introduced.

---

## Part A — AIReviewSidebar Panel Organisms

### `AIReview` — consumed by `AIReviewPanel`
```typescript
interface AIReview {
  grade: string;                // e.g., "B+"
  confidence: ConfidenceLevel;  // 'high' | 'medium' | 'low'
  riskFlags: RiskFlag[];
}

interface RiskFlag {
  id: string;
  label: string;
  severity: FlagSeverity;       // 'high' | 'medium' | 'low'
  description: string;
}
```
**Source**: `sampleAIReview` imported directly from `$lib/shared-mockdata/strategy.ts`

---

### `ResourceUsage` — consumed by `ResourceCostPanel`
```typescript
interface ResourceUsage {
  tokensUsed: number;
  tokensTotal: number;
  backtestsUsed: number;
  backtestsTotal: number;
  queuePosition: number;
  estimatedRuntime: string;     // e.g., "~42s"
  complexityScore: number;
  planImpact: PlanImpact;       // 'low' | 'medium' | 'high'
}
```
**Source**: `sampleResourceUsage` imported directly from `$lib/shared-mockdata/strategy.ts`

---

### `ChatMessage` — owned as local `$state` by `AIChatPanel`
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```
**State**: `messages: ChatMessage[]` initialized as `$state<ChatMessage[]>([])` — resets on unmount per natural Svelte 5 `$state` per-instance lifecycle.

---

### `TradeRecord[]` — consumed by `QuickActionsPanel` (CSV export)
```typescript
interface TradeRecord { ... }  // full definition in src/lib/types/index.ts
```
**Source**: `sampleTrades` imported from `$lib/shared-mockdata/trades.ts`; `tradesToCsv` utility also imported from same module.

---

## Part F — Strategy & Backtest State Stores (New Modules)

### `strategyState` — new module: `src/lib/state/strategy.svelte.ts`

```typescript
// src/lib/state/strategy.svelte.ts
import { sampleStrategy } from '$lib/shared-mockdata/strategy';

const strategyState = {
  inputText: $state<string>(''),
  parsedStrategy: $state<ParsedStrategy | null>(null),

  reset() {
    this.inputText = '';
    this.parsedStrategy = null;
  },

  getStrategyConfig(): ParsedStrategy {
    return this.parsedStrategy ?? sampleStrategy;
  }
};

export { strategyState };
```

**Replaces**: `appState.strategyInputText` (removed from `appState`) and the exported `parsedStrategy` / `getStrategyConfig` functions from `strategy-builder/+page.svelte`.

**Consumers**: `strategy-builder/+page.svelte` (binds `inputText`, writes `parsedStrategy`), `QuickActionsPanel.svelte` (`strategyState.reset()`), `TopBar.svelte` (`strategyState.getStrategyConfig()`), `AIResearchBox.svelte` (writes `strategyState.inputText`).

---

### `backtestState` — new module: `src/lib/state/backtest.svelte.ts`

```typescript
// src/lib/state/backtest.svelte.ts
const backtestState = {
  mode: $state<string>('Single Stock'),
  initialCapital: $state<string>('100000'),
  startDate: $state<string>('2020-01-01'),
  endDate: $state<string>('2024-12-31'),
  universe: $state<string>('SPY'),
  timeframe: $state<string>('Daily'),
  direction: $state<string>('Long'),
  orderTypes: $state<string[]>([...]),  // matches current backtest-engine page defaults

  reset() {
    this.mode = 'Single Stock';
    this.initialCapital = '100000';
    this.startDate = '2020-01-01';
    this.endDate = '2024-12-31';
    this.universe = 'SPY';
    this.timeframe = 'Daily';
    this.direction = 'Long';
    this.orderTypes = [...defaults];
  }
};

export { backtestState };
```

**Replaces**: All local `$state` field declarations in `backtest-engine/+page.svelte`. The route page binds form inputs directly to `backtestState` fields so `reset()` is effective regardless of whether the page is mounted.

**Consumers**: `backtest-engine/+page.svelte` (binds all form fields), `QuickActionsPanel.svelte` (`backtestState.reset()`).

---

## Part H — NavSection Type Extension

### `NavSection` — extended in `src/lib/types/index.ts`

**Before**:
```typescript
export interface NavSection {
  id: SectionId;
  labelKey: string;
  icon: string;
  group: NavGroup;
}
```

**After** (add `path` field):
```typescript
export interface NavSection {
  id: SectionId;
  path: string;       // canonical route path, e.g., '/research-workbench'
  labelKey: string;
  icon: string;
  group: NavGroup;
}
```

**Canonical path mapping** (3 mismatches with SectionId values — resolved by path field):

| SectionId | path | Notes |
|-----------|------|-------|
| `'dashboard'` | `'/research-workbench'` | ID unchanged; path reflects actual route |
| `'strategy-builder'` | `'/strategy-builder'` | Match |
| `'fundamental-screener'` | `'/fundamental-screener'` | Match |
| `'technical-screener'` | `'/technical-screener'` | Match |
| `'backtest-engine'` | `'/backtest-engine'` | Match |
| `'performance-result'` | `'/performance-result'` | Match |
| `'market-regime'` | `'/market-regime'` | Match |
| `'sentiment-events'` | `'/sentiment-events'` | Match |
| `'trade-log'` | `'/trade-lot'` | ID has `-log`, route has `-lot` |
| `'settings-billing'` | `'/setting-billing'` | ID has `settings-`, route has `setting-` |

**Consumers**: `MainMenuGroup.svelte` (anchor hrefs + active state), `ResultMenuGroup.svelte` (anchor hrefs + active state). Active state uses `page.url.pathname === section.path`.

---

## Local State per Organism (All Parts)

| Organism | State Variable | Type | Initial Value | Store Module |
|----------|---------------|------|---------------|-------------|
| `AIChatPanel` | `messages` | `ChatMessage[]` | `[]` | Local `$state` (per-instance) |
| `AIChatPanel` | `chatInput` | `string` | `''` | Local `$state` (per-instance) |
| `AIResearchBox` | `aiText` | `string` | `''` | Local `$state` (per-instance) |
| `AIResearchBox` | `validationError` | `string \| null` | `null` | Local `$state` (per-instance) |
| `PerformanceMetricGrid` | `tiles` | `MetricTile[]` | `defaultMetricTiles` | Local `$state` |
| `PerformanceMetricGrid` | `draggedIndex` | `number \| null` | `null` | Local `$state` |
| `PerformancdeChartTabs` | `activeChartTab` | `string` | `'equity-curve'` | Local `$state` |
| `AIReviewPanel` | — | — | — | Stateless |
| `ResourceCostPanel` | — | — | — | Stateless |
| `QuickActionsPanel` | — | — | — | Stateless (side effects via strategyState/backtestState) |
| `DashboardMetricGrid` | — | — | — | Stateless |
| `FunctionGateways` | — | — | — | Stateless |

---

## External Dependencies per Organism (All Parts)

| Organism | Imports | Context / Side Effects |
|----------|---------|----------------------|
| `AIReviewPanel` | `sampleAIReview`, `RiskFlagItem`, `Badge` | None |
| `ResourceCostPanel` | `sampleResourceUsage`, `Progress` | None |
| `AIChatPanel` | `Button`, `Textarea`, `ChatMessage` type | None |
| `QuickActionsPanel` | `strategyState`, `backtestState`, `sampleTrades`, `tradesToCsv`, `Button`, `toast`, `goto` | Calls `strategyState.reset()` / `backtestState.reset()` / `goto('/path')` |
| `TopBar` | `strategyState`, `goto` | Calls `strategyState.getStrategyConfig()` / `goto('/strategy-builder')` |
| `AIResearchBox` | `strategyState`, `goto` | Writes `strategyState.inputText`; calls `goto('/strategy-builder')` |
| `FunctionGateways` | `goto` | Calls `goto('/' + card.id)` on click |
| `DashboardMetricGrid` | `sampleMarketMetrics`, `MetricTile` | None |
| `PerformanceMetricGrid` | `defaultMetricTiles`, `MetricTile` | None |
| `PerformancdeChartTabs` | `sampleBacktestResult`, `layerchart` | None |
| `MainMenuGroup` | `page` from `$app/state`, `NavSection` type | Active state: `page.url.pathname === section.path` |
| `ResultMenuGroup` | `page` from `$app/state`, `NavSection` type | Active state: `page.url.pathname === section.path` |

---

## Removed State Fields

| Field | Removed From | Migrated To |
|-------|-------------|-------------|
| `activeSection: SectionId` | `appState` (`app.svelte.ts`) | Removed; navigation via `goto()` |
| `strategyInputText: string` | `appState` (`app.svelte.ts`) | `strategyState.inputText` |

---

## Schema Changes Summary

- **New**: `$lib/state/strategy.svelte.ts` — `strategyState` reactive object
- **New**: `$lib/state/backtest.svelte.ts` — `backtestState` reactive object
- **Modified**: `NavSection` interface gains `path: string` field
- **Removed**: `appState.activeSection`, `appState.strategyInputText`
- **No Zod schemas**: No new data contracts or API surfaces
- **No persistence**: All data is in-memory mock
