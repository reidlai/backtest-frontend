import { z } from 'zod';

/**
 * Scalar performance summary for a backtest result.
 * All 8 fields are required per OpenAPI spec.
 */
export const PerformanceMetricsSchema = z.object({
	total_return_pct: z.number(),
	annualized_return_pct: z.number(),
	max_drawdown_pct: z.number(),
	sharpe_ratio: z.number(),
	sortino_ratio: z.number(),
	win_rate: z.number(),
	profit_factor: z.number(),
	total_trades: z.number().int()
});

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
