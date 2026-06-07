/**
 * Re-exports the canonical BacktestResultResource schemas from src/lib/zodios/schemas/.
 * Import paths using '$lib/schemas/backtest-result.schema' continue to work.
 *
 * Migration note: the monolithic BacktestResultSchema is decomposed into four
 * separate OpenAPI-aligned types. BacktestResultSchema is kept as a compatibility
 * alias pointing to BacktestResultResourceSchema.
 *
 * Removed fields: totalReturn, netProfit, maxDrawdown (→ PerformanceMetrics),
 *   equityCurve/drawdownSeries/monthlyReturns/benchmarkSeries (→ EquityCurve),
 *   sharpeRatio, winRate, profitFactor, volatility, exposureTime
 */
export {
	BacktestResultResourceSchema,
	BacktestResultResourceSchema as BacktestResultSchema,
	PagedBacktestResultResourceSchema,
	type BacktestResultResource,
	type BacktestResultResource as BacktestResult,
	type PagedBacktestResultResource
} from '$lib/zodios/schemas/backtest-result.schema.js';
