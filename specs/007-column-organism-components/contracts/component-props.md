# Contract: Organism Component Props & State API

**Module**: Backtest Engine Column Organisms
**Type**: Internal UI component contracts
**Date**: 2026-05-28

This document defines the stable public interface for each new organism component: its accepted props, the state singleton it owns, and its behavioral guarantees. Downstream consumers (Storybook stories, unit tests, the backtest engine page) MAY rely on these contracts.

---

## `UniverseCapitalConfig`

**File**: `src/lib/components/organisms/UniverseCapitalConfig.svelte`
**Story**: `src/stories/UniverseCapitalConfig.stories.svelte`

### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| _(none)_ | — | — | — | No props — organism reads/writes its own singleton |

### Owned State Singleton

**Import**: `import { universeCapitalConfigState } from '$lib/state/universe-capital-config.svelte'`

| Member | Type | Description |
| --- | --- | --- |
| `.mode` | `BacktestMode` | Reactive: currently selected backtest mode |
| `.universe` | `string` | Reactive: symbol or universe identifier |
| `.initialCapital` | `string` | Reactive: initial capital amount as string |
| `.reset()` | `() => void` | Resets all fields to schema defaults |

### Behavioral Guarantees

- Initializes all fields from `UniverseCapitalConfigSchema.parse({})` on first import
- DOES NOT import `appState`, `scheduleExecutionConfigState`, or `orderTypesConfigState`
- Can be mounted in Storybook without any page-level context
- State persists for the lifetime of the module (singleton)

---

## `ScheduleExecutionConfig`

**File**: `src/lib/components/organisms/ScheduleExecutionConfig.svelte`
**Story**: `src/stories/ScheduleExecutionConfig.stories.svelte`

### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| _(none)_ | — | — | — | No props — organism reads/writes its own singleton |

### Owned State Singleton

**Import**: `import { scheduleExecutionConfigState } from '$lib/state/schedule-execution-config.svelte'`

| Member | Type | Description |
| --- | --- | --- |
| `.startDate` | `string` | Reactive: ISO 8601 start date string |
| `.endDate` | `string` | Reactive: ISO 8601 end date string |
| `.timeframe` | `string` | Reactive: selected timeframe value |
| `.direction` | `'Long' \| 'Short' \| 'Both'` | Reactive: trading direction |
| `.reset()` | `() => void` | Resets all fields to schema defaults |

### Behavioral Guarantees

- Initializes all fields from `ScheduleExecutionConfigSchema.parse({})` on first import
- DOES NOT import `appState` or sibling organism state
- Can be mounted in Storybook without any page-level context

---

## `OrderTypesConfig`

**File**: `src/lib/components/organisms/OrderTypesConfig.svelte`
**Story**: `src/stories/OrderTypesConfig.stories.svelte`

### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `onRun` | `() => void` | No | `() => {}` | Callback invoked when "Run Backtest" button is clicked. When not provided, button click is a no-op. |

### Owned State Singleton

**Import**: `import { orderTypesConfigState } from '$lib/state/order-types-config.svelte'`

| Member | Type | Description |
| --- | --- | --- |
| `.selectedOrderTypes` | `SvelteSet<OrderType>` | Reactive set of selected order type values |
| `.reset()` | `() => void` | Clears set and re-populates from schema defaults |

### Behavioral Guarantees

- Initializes `selectedOrderTypes` as a `SvelteSet` from `OrderTypesConfigSchema.parse({}).selectedOrderTypes`
- DOES NOT import `appState`, `universeCapitalConfigState`, or `scheduleExecutionConfigState`
- `onRun` is always called as-is; the organism never reads sibling state
- Can be mounted in Storybook with a mock `onRun` prop or no prop at all
- Run Backtest button is always enabled regardless of `onRun` presence (no-op fallback)

---

## Page-Level Coordination Contract

**File**: `src/routes/backtest-engine/+page.svelte`

The page is responsible for all cross-organism coordination. It:

1. Imports all three state singletons
2. Owns `handleRun` — reads from all three singletons when "Run Backtest" is triggered
3. Owns the `$effect` that writes `appState.backtestPrefillSymbol` to `universeCapitalConfigState.universe`
4. Passes `handleRun` as the `onRun` prop to `<OrderTypesConfig>`

```typescript
// Coordination pattern (page-level)
import { universeCapitalConfigState } from '$lib/state/universe-capital-config.svelte';
import { scheduleExecutionConfigState } from '$lib/state/schedule-execution-config.svelte';
import { orderTypesConfigState } from '$lib/state/order-types-config.svelte';

$effect(() => {
  if (appState.backtestPrefillSymbol) {
    universeCapitalConfigState.universe = appState.backtestPrefillSymbol;
  }
});

function handleRun() {
  // aggregate state from all three singletons
  toast.info('Backtest queued and processing...');
}
```

---

## `QuickActionsPanel` Reset Contract

**File**: `src/lib/components/organisms/QuickActionsPanel.svelte`

After the refactor, the `reset()` call must invoke all three singletons:

```typescript
import { universeCapitalConfigState } from '$lib/state/universe-capital-config.svelte';
import { scheduleExecutionConfigState } from '$lib/state/schedule-execution-config.svelte';
import { orderTypesConfigState } from '$lib/state/order-types-config.svelte';

function handleReset() {
  universeCapitalConfigState.reset();
  scheduleExecutionConfigState.reset();
  orderTypesConfigState.reset();
}
```

The `backtestState` import is removed entirely from this file.
