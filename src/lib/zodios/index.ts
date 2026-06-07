// ── Market Metric schemas ──────────────────────────────────────────────────────
export {
	MarketMetricResultSchema,
	MarketMetricCollectionResultSchema,
	type MarketMetricResult,
	type MarketMetricCollectionResult
} from './schemas/market-metric.schema.js';

// ── Response schemas ───────────────────────────────────────────────────────────
export { ErrorResponseSchema, type ErrorResponse } from './schemas/error-response.schema.js';
export { HealthResponseSchema, type HealthResponse } from './schemas/health.schema.js';
export { ActionResponseSchema, type ActionResponse } from './schemas/action-response.schema.js';
export { SignalRecordSchema, type SignalRecord } from './schemas/signal-record.schema.js';
export {
	PerformanceMetricsSchema,
	type PerformanceMetrics
} from './schemas/performance-metrics.schema.js';
export { EquityCurveSchema, type EquityCurve } from './schemas/equity-curve.schema.js';
export { TradeRecordSchema, type TradeRecord } from './schemas/trade-record.schema.js';
export {
	EntryConfigSchema,
	ExitConfigSchema,
	LiquidityFilterSchema,
	StrategyConfigSchema,
	type EntryConfig,
	type ExitConfig,
	type LiquidityFilter,
	type StrategyConfig
} from './schemas/strategy-config.schema.js';
export {
	StrategyResultSchema,
	PagedStrategyResultSchema,
	type StrategyResult,
	type PagedStrategyResult
} from './schemas/strategy.schema.js';
export {
	BacktestConfigSchema,
	BacktestRunResultSchema,
	PagedBacktestRunResultSchema,
	type BacktestConfig,
	type BacktestRunResult,
	type PagedBacktestRunResult
} from './schemas/backtest-run.schema.js';
export {
	BacktestResultResourceSchema,
	PagedBacktestResultResourceSchema,
	type BacktestResultResource,
	type PagedBacktestResultResource
} from './schemas/backtest-result.schema.js';

// ── Request body schemas ───────────────────────────────────────────────────────
export {
	BacktestRunServiceCreateRequestBodySchema,
	StrategyServiceUpsertRequestBodySchema,
	StrategyServiceReplaceRequestBodySchema,
	StrategyServicePatchRequestBodySchema,
	type BacktestRunServiceCreateRequestBody,
	type StrategyServiceUpsertRequestBody,
	type StrategyServiceReplaceRequestBody,
	type StrategyServicePatchRequestBody
} from './schemas/request-bodies.schema.js';
