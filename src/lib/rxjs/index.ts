/**
 * Public barrel export for the RxJS state management module.
 *
 * All BehaviorSubjects and refresh functions are exported with aliased names
 * per contracts/rxjs-module-api.md for tree-shaking-friendly imports.
 *
 * Usage:
 *   import { marketMetricsData$, refreshMarketMetrics } from '$lib/rxjs';
 *
 * Feature: 022-rxjs-state-management
 */

// ── Market Metrics ─────────────────────────────────────────────────────────────
export {
	marketMetricsData$,
	marketMetricsError$,
	marketMetricsLoading$,
	refreshMarketMetrics
} from './market-metrics.stream.js';

// ── Strategies ─────────────────────────────────────────────────────────────────
export {
	strategiesData$,
	strategiesError$,
	strategiesLoading$,
	refreshStrategies
} from './strategies.stream.js';

// ── Backtest Runs ──────────────────────────────────────────────────────────────
export {
	backtestRunsData$,
	backtestRunsError$,
	backtestRunsLoading$,
	refreshBacktestRuns
} from './backtest-runs.stream.js';
