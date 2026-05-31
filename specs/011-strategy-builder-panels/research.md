# Research: Strategy Builder Input and Output Panels

**Date**: 2026-05-31
**Branch**: `011-strategy-builder-panels`

## Decision 1: State Management Approach

- **Decision**: Extend the existing `StrategyState` class in `src/lib/state/strategy.svelte.ts` with three new reactive fields: `isRunning` (boolean), `backtestResult` (BacktestResult | null), and `runError` (string | null).
- **Rationale**: The codebase already uses a Svelte 5 rune-based class singleton pattern for `strategyState`. Adding fields to the existing class is consistent, avoids introducing a new pattern, and satisfies FR-007 (independent renderability) since both organisms read from the same shared singleton.
- **Alternatives considered**: Svelte store (writable/derived) — rejected as it mixes paradigms with the existing rune-based approach; prop drilling — rejected as it couples the page layout to panel internals.

## Decision 2: Input Panel Schema Fields

- **Decision**: `StrategyInputPanelSchema` wraps `strategyState.inputText` (string) as the sole required prop. The "Run" button behaviour and disabled state are derived from `strategyState.isRunning` and inline validation.
- **Rationale**: The existing `StrategyState` already holds `inputText`. The Input Panel is a thin organism over the existing textarea; the parse/run action mutates `strategyState` directly rather than passing all fields as props, consistent with the existing organism pattern (organisms read/write shared state, not pure components).
- **Alternatives considered**: Full prop-based Input Panel with all `BacktestParamsSchema` fields — deferred; this feature scope is the structural refactor, not a full parameter form redesign.

## Decision 3: Output Panel Content

- **Decision**: `StrategyOutputPanel` renders three display sections using existing schemas:
  1. **Performance Metrics**: `totalReturn`, `sharpeRatio`, `maxDrawdown`, `winRate`, `profitFactor` from `BacktestResultSchema` — displayed using existing `MetricTile` molecule atoms.
  2. **Equity Curve Chart**: `equityCurve` (array of `TimeSeriesPoint`) — rendered with `layerchart` (already a project dependency).
  3. **Trade Summary Table**: `tradeId`, `symbol`, `direction`, `entryDate`, `exitDate`, `netPnl`, `returnPct` columns from `TradeRecordSchema` (existing) — rendered with shadcn Table primitives.
- **Rationale**: All required schemas (`BacktestResultSchema`, `TradeRecordSchema`, `TimeSeriesPointSchema`) already exist. `layerchart` is an existing dependency. This avoids introducing new data shapes or libraries.
- **Alternatives considered**: Custom chart library — rejected; `layerchart` already used in `PerformanceChartTabs` organism.

## Decision 4: Validation Strategy for Input Panel

- **Decision**: Client-side validation gates the "Run" button. `inputText` must be non-empty (≥10 characters) to enable the button. Inline error message appears below the textarea when the field is touched and invalid.
- **Rationale**: Simple text-length guard matches the current UX (user enters a free-text strategy description). Zod `.min(10)` on `inputText` provides a testable boundary. No server-side validation is needed at this layer.
- **Alternatives considered**: Full `BacktestParamsSchema` form validation — deferred; out of scope for this structural refactor.

## Decision 5: Storybook Story Pattern

- **Decision**: Use `.stories.svelte` files with `defineMeta` from `@storybook/addon-svelte-csf`, matching the existing `DashboardMetricGrid.stories.svelte` and `AIChatPanel.stories.svelte` pattern. Stories cover: Default (empty), Loading, Result Populated, Error states for `StrategyOutputPanel`; Default and Validation Error states for `StrategyInputPanel`.
- **Rationale**: Consistent with all existing organism stories in `src/stories/`. The Storybook-first workflow (Rule 12) requires all states to be verified before BDD/backend wiring.
- **Alternatives considered**: `.stories.ts` format — not used in this project; project uses `.stories.svelte`.
