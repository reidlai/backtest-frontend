# Component Contract: ScreenerFilterPanel

**Type**: Svelte 5 Organism Component  
**File**: `src/lib/components/organisms/ScreenerFilterPanel.svelte`

## Props

None. The component is fully self-contained.

## Exports (module-level)

| Export | Type | Description |
|---|---|---|
| `snapshot` | `Snapshot<FundamentalScreenerState>` | SvelteKit snapshot for navigation state restore |

## Rendered UI

| Element | Binding | Default Value |
|---|---|---|
| Universe `Select` | `state.universe` | `'S&P 500'` |
| PE Ratio ≤ `Input` | `state.peMax` | `'30'` |
| ROIC (%) ≥ `Input` | `state.roicMin` | `'15'` |
| Rev Growth (%) ≥ `Input` | `state.revGrowthMin` | `'10'` |

## Snapshot Behaviour

- `capture()`: returns `{ universe, peMax, roicMin, revGrowthMin }` from current internal state
- `restore(value)`: calls `FundamentalScreenerSchema.safeParse(value)`; on success applies all four fields to internal state; on failure no-ops (invalid data ignored)

## Constraints

- Must not emit any events or expose state to the parent
- Must preserve existing Tailwind layout classes from the original inline filter block
