# Data Model: Zod Schemas per Organism

**Phase**: 1 — Design & Contracts
**Date**: 2026-05-24

All schemas live in `src/lib/schemas/`. Each schema exports one named constant following the pattern `<OrganismName>Schema` and one derived TypeScript type `<OrganismName>State` (or `<OrganismName>Props` for props-only organisms).

## Schema Conventions

```ts
import { z } from 'zod';
import type { ExistingType } from '$lib/types';

export const MyOrganismSchema = z.object({
  field: z.string().default('initial'),
  complexField: z.custom<ExistingType[]>().default([]),
});

export type MyOrganismState = z.infer<typeof MyOrganismSchema>;
```

**Usage in component with local `$state`**:
```ts
let state = $state(MyOrganismSchema.parse({}));
// state.field → string (typed)
// mutations: state.field = 'new value'
```

**Usage in `StubSection` with `$props()`** (type inference only):
```ts
let { title = '' }: StubSectionProps = $props();
```

---

## Schema Definitions

### 1. `ai-chat-panel.schema.ts`

```ts
import { z } from 'zod';
import type { ChatMessage } from '$lib/types';

export const AIChatPanelSchema = z.object({
  chatInput: z.string().default(''),
  messages: z.custom<ChatMessage[]>().default([]),
});

export type AIChatPanelState = z.infer<typeof AIChatPanelSchema>;
```

**Fields**: `chatInput` (user-typed text), `messages` (chat history)
**Reactive state**: Yes — both fields are `$state`
**Nested type**: `ChatMessage` via `z.custom<ChatMessage[]>()`

---

### 2. `ai-research-box.schema.ts`

```ts
import { z } from 'zod';

export const AIResearchBoxSchema = z.object({
  aiText: z.string().default(''),
  validationError: z.boolean().default(false),
});

export type AIResearchBoxState = z.infer<typeof AIResearchBoxSchema>;
```

**Fields**: `aiText` (input text), `validationError` (error display flag)
**Reactive state**: Yes
**Note**: `strategyState` is read-only external state — excluded per FR-005

---

### 3. `ai-review-panel.schema.ts`

```ts
import { z } from 'zod';

export const AIReviewPanelSchema = z.object({});

export type AIReviewPanelState = z.infer<typeof AIReviewPanelSchema>;
```

**Fields**: None — stateless organism
**Note**: Empty schema per FR-006

---

### 4. `ai-review-sidebar.schema.ts`

```ts
import { z } from 'zod';

export const AIReviewSidebarSchema = z.object({});

export type AIReviewSidebarState = z.infer<typeof AIReviewSidebarSchema>;
```

**Fields**: None — stateless organism

---

### 5. `dashboard-metric-grid.schema.ts`

```ts
import { z } from 'zod';

export const DashboardMetricGridSchema = z.object({});

export type DashboardMetricGridState = z.infer<typeof DashboardMetricGridSchema>;
```

**Fields**: None — stateless organism

---

### 6. `function-gateways.schema.ts`

```ts
import { z } from 'zod';
import type { IFunctionGatewayCard } from '$lib/types';

export const FunctionGatewaysSchema = z.object({
  gatewayCards: z.custom<IFunctionGatewayCard[]>().default([]),
});

export type FunctionGatewaysState = z.infer<typeof FunctionGatewaysSchema>;
```

**Fields**: `gatewayCards` (static card data)
**Note**: Currently a `const` — schema documents the shape; component initializes from `defaultGatewayCards` data, not `Schema.parse({})` (empty default is a type placeholder only)

---

### 7. `live-control-form.schema.ts`

```ts
import { z } from 'zod';

export const LiveControlFormSchema = z.object({});

export type LiveControlFormState = z.infer<typeof LiveControlFormSchema>;
```

**Fields**: None — reads `appState.simulatedMetrics` (global state, excluded per FR-005)

---

### 8. `main-menu-group.schema.ts`

```ts
import { z } from 'zod';
import type { NavSection } from '$lib/types';

export const MainMenuGroupSchema = z.object({
  mainSections: z.custom<NavSection[]>().default([]),
});

export type MainMenuGroupState = z.infer<typeof MainMenuGroupSchema>;
```

**Fields**: `mainSections` (static nav structure)
**Note**: Currently a `const` — schema documents the shape; actual data initialized from static data, not `Schema.parse({})`

---

### 9. `navigation-sidebar.schema.ts`

```ts
import { z } from 'zod';

export const NavigationSidebarSchema = z.object({});

export type NavigationSidebarState = z.infer<typeof NavigationSidebarSchema>;
```

**Fields**: None — pure container organism

---

### 10. `performance-chart-tabs.schema.ts`

```ts
import { z } from 'zod';

export const PerformanceChartTabsSchema = z.object({
  activeChartTab: z
    .enum(['equity-curve', 'drawdown', 'benchmark-overlay', 'monthly-heatmap'])
    .default('equity-curve'),
});

export type PerformanceChartTabsState = z.infer<typeof PerformanceChartTabsSchema>;
```

**Fields**: `activeChartTab` (active tab identifier)
**Note**: Uses `z.enum()` for full runtime validation (see research.md Decision 3). Schema file uses corrected spelling; organism file typo (`PerformancdeChartTabs.svelte`) is unchanged in this feature.

---

### 11. `performance-metric-grid.schema.ts`

```ts
import { z } from 'zod';
import type { MetricTile } from '$lib/types';

export const PerformanceMetricGridSchema = z.object({
  tiles: z.custom<MetricTile[]>().default([]),
  draggedIndex: z.number().nullable().default(null),
  editingTileId: z.string().nullable().default(null),
  editValue: z.string().default(''),
  modalOpen: z.boolean().default(false),
});

export type PerformanceMetricGridState = z.infer<typeof PerformanceMetricGridSchema>;
```

**Fields**: 5 reactive state fields consolidated from individual `$state` vars
**Note**: `tiles` is initialized from `defaultMetricTiles` in the component after `Schema.parse({})` — the `[]` default is the schema fallback; component overwrites with actual data on mount

---

### 12. `quick-actions-panel.schema.ts`

```ts
import { z } from 'zod';

export const QuickActionsPanelSchema = z.object({});

export type QuickActionsPanelState = z.infer<typeof QuickActionsPanelSchema>;
```

**Fields**: None — reads `strategyState` and `backtestState` (global, excluded per FR-005)

---

### 13. `resource-cost-panel.schema.ts`

```ts
import { z } from 'zod';

export const ResourceCostPanelSchema = z.object({});

export type ResourceCostPanelState = z.infer<typeof ResourceCostPanelSchema>;
```

**Fields**: None — stateless organism

---

### 14. `result-menu-group.schema.ts`

```ts
import { z } from 'zod';
import type { NavSection } from '$lib/types';

export const ResultMenuGroupSchema = z.object({
  resultSections: z.custom<NavSection[]>().default([]),
});

export type ResultMenuGroupState = z.infer<typeof ResultMenuGroupSchema>;
```

**Fields**: `resultSections` (static nav structure)
**Note**: Currently a `const` — same pattern as `MainMenuGroup`

---

### 15. `stub-section.schema.ts`

```ts
import { z } from 'zod';

export const StubSectionSchema = z.object({
  title: z.string().default('Section'),
});

export type StubSectionProps = z.infer<typeof StubSectionSchema>;
```

**Fields**: `title` (prop with default `'Section'` matching current `$props()` default)
**Note**: Type is named `StubSectionProps` (not `State`) — used for `$props()` type annotation only, no runtime `.parse()`

---

### 16. `top-bar.schema.ts`

```ts
import { z } from 'zod';

export const TopBarSchema = z.object({});

export type TopBarState = z.infer<typeof TopBarSchema>;
```

**Fields**: None — reads `appState` and `strategyState` (global, excluded per FR-005)

---

## `index.ts` Barrel Export

```ts
export * from './ai-chat-panel.schema';
export * from './ai-research-box.schema';
export * from './ai-review-panel.schema';
export * from './ai-review-sidebar.schema';
export * from './dashboard-metric-grid.schema';
export * from './function-gateways.schema';
export * from './live-control-form.schema';
export * from './main-menu-group.schema';
export * from './navigation-sidebar.schema';
export * from './performance-chart-tabs.schema';
export * from './performance-metric-grid.schema';
export * from './quick-actions-panel.schema';
export * from './resource-cost-panel.schema';
export * from './result-menu-group.schema';
export * from './stub-section.schema';
export * from './top-bar.schema';
```

---

## Component Update Pattern

### Organisms with `$state` (4 components modified)

**Before** (`PerformancdeChartTabs.svelte`):
```ts
let activeChartTab = $state<ChartTab>('equity-curve');
```

**After**:
```ts
import { PerformanceChartTabsSchema } from '$lib/schemas';
let state = $state(PerformanceChartTabsSchema.parse({}));
// Template: use state.activeChartTab instead of activeChartTab
```

**Before** (`PerformanceMetricGrid.svelte`):
```ts
let tiles = $state([...defaultMetricTiles]);
let draggedIndex = $state<number | null>(null);
let editingTileId = $state<string | null>(null);
let editValue = $state('');
let modalOpen = $state(false);
```

**After**:
```ts
import { PerformanceMetricGridSchema } from '$lib/schemas';
let state = $state(PerformanceMetricGridSchema.parse({}));
state.tiles = [...defaultMetricTiles]; // initialize with actual data
// Template: state.tiles, state.draggedIndex, state.modalOpen, etc.
// Handlers: state.draggedIndex = index; state.tiles = newTiles; etc.
```

### `StubSection` Props Pattern

**Before**:
```ts
let { title = 'Section' } = $props();
```

**After**:
```ts
import type { StubSectionProps } from '$lib/schemas';
let { title = 'Section' }: StubSectionProps = $props();
```
