import { z } from 'zod';
import { PerformanceMetricsSchema } from './performance-metrics.schema.js';
import { EquityCurveSchema } from './equity-curve.schema.js';
import { TradeRecordSchema } from './trade-record.schema.js';
import { SignalRecordSchema } from './signal-record.schema.js';
import { pagedSchema } from './_paged.js';

/**
 * Per-symbol/per-period result nested under a BacktestRun.
 * All four sub-domains are always required and fully populated.
 */
export const BacktestResultResourceSchema = z.object({
	id: z.string().uuid(),
	run_id: z.string().uuid(),
	label: z.string(),
	created_at: z.string(),
	performance_metrics: PerformanceMetricsSchema,
	equity_curve: EquityCurveSchema,
	execution_log: z.array(TradeRecordSchema),
	signal_history: z.array(SignalRecordSchema)
});

export type BacktestResultResource = z.infer<typeof BacktestResultResourceSchema>;

export const PagedBacktestResultResourceSchema = pagedSchema(BacktestResultResourceSchema);

export type PagedBacktestResultResource = z.infer<typeof PagedBacktestResultResourceSchema>;
