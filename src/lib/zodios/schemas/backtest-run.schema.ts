import { z } from 'zod';
import { pagedSchema } from './_paged.js';

// ── Backtest execution configuration ──────────────────────────────────────────

export const BacktestConfigSchema = z.object({
	start_date: z.string(),
	end_date: z.string(),
	initial_capital: z.number(),
	symbols: z.array(z.string()),
	commission_rate: z.number(),
	slippage_model: z.string(),
	// Optional slippage overrides (required when slippage_model matches)
	fixed_slippage: z.number().optional(),
	percentage_slippage: z.number().optional(),
	atr_slippage_multiple: z.number().optional()
});

export type BacktestConfig = z.infer<typeof BacktestConfigSchema>;

// ── Backtest run result ────────────────────────────────────────────────────────

export const BacktestRunResultSchema = z.object({
	id: z.string().uuid(),
	strategy_ids: z.array(z.string()),
	strategy_versions: z.array(z.string()),
	status: z.enum(['pending', 'running', 'completed', 'failed']),
	config: BacktestConfigSchema,
	start_time: z.string().optional(),
	end_time: z.string().optional()
});

export type BacktestRunResult = z.infer<typeof BacktestRunResultSchema>;

export const PagedBacktestRunResultSchema = pagedSchema(BacktestRunResultSchema);

export type PagedBacktestRunResult = z.infer<typeof PagedBacktestRunResultSchema>;
