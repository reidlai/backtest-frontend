# Contract: Schema Public Exports

**Module**: `$lib/schemas` (re-exported from `src/lib/schemas/index.ts`)
**Type**: Internal TypeScript module contract

This document lists the stable public surface of the `$lib/schemas` module after this feature ships. Any consumer importing from `$lib/schemas` can rely on these exports.

## Exported Schemas and Types

| Export Name | Type | Description |
|---|---|---|
| `AIChatPanelSchema` | `ZodObject` | Schema for AIChatPanel local state |
| `AIChatPanelState` | `type` | Inferred type: `{ chatInput: string; messages: ChatMessage[] }` |
| `AIResearchBoxSchema` | `ZodObject` | Schema for AIResearchBox local state |
| `AIResearchBoxState` | `type` | Inferred type: `{ aiText: string; validationError: boolean }` |
| `AIReviewPanelSchema` | `ZodObject` | Empty schema (stateless organism) |
| `AIReviewPanelState` | `type` | Inferred type: `{}` |
| `AIReviewSidebarSchema` | `ZodObject` | Empty schema (stateless organism) |
| `AIReviewSidebarState` | `type` | Inferred type: `{}` |
| `DashboardMetricGridSchema` | `ZodObject` | Empty schema (stateless organism) |
| `DashboardMetricGridState` | `type` | Inferred type: `{}` |
| `FunctionGatewaysSchema` | `ZodObject` | Schema for FunctionGateways data shape |
| `FunctionGatewaysState` | `type` | Inferred type: `{ gatewayCards: IFunctionGatewayCard[] }` |
| `LiveControlFormSchema` | `ZodObject` | Empty schema (reads global state only) |
| `LiveControlFormState` | `type` | Inferred type: `{}` |
| `MainMenuGroupSchema` | `ZodObject` | Schema for MainMenuGroup data shape |
| `MainMenuGroupState` | `type` | Inferred type: `{ mainSections: NavSection[] }` |
| `NavigationSidebarSchema` | `ZodObject` | Empty schema (container organism) |
| `NavigationSidebarState` | `type` | Inferred type: `{}` |
| `PerformanceChartTabsSchema` | `ZodObject` | Schema for chart tab selection |
| `PerformanceChartTabsState` | `type` | Inferred type: `{ activeChartTab: 'equity-curve' \| 'drawdown' \| 'benchmark-overlay' \| 'monthly-heatmap' }` |
| `PerformanceMetricGridSchema` | `ZodObject` | Schema for metric grid state (5 fields) |
| `PerformanceMetricGridState` | `type` | Inferred type: `{ tiles: MetricTile[]; draggedIndex: number \| null; editingTileId: string \| null; editValue: string; modalOpen: boolean }` |
| `QuickActionsPanelSchema` | `ZodObject` | Empty schema (reads global state only) |
| `QuickActionsPanelState` | `type` | Inferred type: `{}` |
| `ResourceCostPanelSchema` | `ZodObject` | Empty schema (stateless organism) |
| `ResourceCostPanelState` | `type` | Inferred type: `{}` |
| `ResultMenuGroupSchema` | `ZodObject` | Schema for ResultMenuGroup data shape |
| `ResultMenuGroupState` | `type` | Inferred type: `{ resultSections: NavSection[] }` |
| `StubSectionSchema` | `ZodObject` | Schema for StubSection prop shape |
| `StubSectionProps` | `type` | Inferred type: `{ title: string }` — used as `$props()` annotation |
| `TopBarSchema` | `ZodObject` | Empty schema (reads global state only) |
| `TopBarState` | `type` | Inferred type: `{}` |

## Stability Guarantee

All exports listed above are stable for the lifetime of this feature. Downstream consumers (e.g., future organism schemas, Storybook stories, unit tests) may import any of these exports from `$lib/schemas`.

## Out of Scope

This contract does not expose or replace the global state singletons (`appState`, `backtestState`, `strategyState`) in `src/lib/state/`. Those remain their own module with their own contracts.
