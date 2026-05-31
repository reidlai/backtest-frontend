# Data Model: Fix UI Runtime Errors

**Branch**: `009-fix-ui-runtime-errors` | **Date**: 2026-05-31

## Entities

### SimulatedMetrics

Represents the output of a simulated backtest. Held as a reactive property on the `AppState` singleton.

| Field | Type | Default | Validation | Notes |
|---|---|---|---|---|
| `totalReturn` | `number` | `0` | Required, numeric | Percentage return; e.g., `42.8` means 42.8% |
| `maxDrawdown` | `number` | `0` | Required, numeric | Negative percentage; e.g., `-18.2` means -18.2% drawdown |
| `winRate` | `number` | `0` | Required, numeric | Percentage win rate; e.g., `58.3` means 58.3% |

**State transitions**:
- Initial state: all fields `0` (set by AppState constructor via `AppStateSchema.parse({})`)
- After backtest: all fields updated to computed results
- On page navigation: values persist in `appState` singleton (not reset)

### AppState (extended)

The existing singleton extended with `simulatedMetrics`.

| Field | Type | Default | Notes |
|---|---|---|---|
| `backtestPrefillSymbol` | `string` | `''` | Existing field — unchanged |
| `simulatedMetrics` | `SimulatedMetrics` | `{ totalReturn: 0, maxDrawdown: 0, winRate: 0 }` | New field added by this fix |

## Zod Schema Changes

### New: `SimulatedMetricsSchema`

```
src/lib/schemas/app-state.schema.ts
```

```typescript
export const SimulatedMetricsSchema = z.object({
  totalReturn: z.number().default(0),
  maxDrawdown: z.number().default(0),
  winRate:     z.number().default(0)
});

export const AppStateSchema = z.object({
  backtestPrefillSymbol: z.string().default(''),
  simulatedMetrics: SimulatedMetricsSchema.default({})
});
```

### Updated: `AppState` class

```
src/lib/state/app.svelte.ts
```

```typescript
class AppState {
  backtestPrefillSymbol = $state(_defaults.backtestPrefillSymbol);
  simulatedMetrics      = $state(_defaults.simulatedMetrics);
}
```

## Relationships

```
AppState (singleton)
  └── simulatedMetrics: SimulatedMetrics
        ├── totalReturn: number
        ├── maxDrawdown: number
        └── winRate: number

PerformanceResultPage ($effect)
  └── reads appState.simulatedMetrics.{totalReturn, maxDrawdown, winRate}
```

## No External Contracts

`simulatedMetrics` is an internal state entity. No API endpoints, event schemas, or cross-service contracts are introduced by this fix.
