import { z } from 'zod';

// ── Entry execution configuration ─────────────────────────────────────────────

export const EntryConfigSchema = z.object({
	order_type: z.string(),
	execution_timing: z.string(),
	commission_model: z.string(),
	commission_rate: z.number(),
	slippage_model: z.string(),
	slippage_value: z.number().optional()
});

export type EntryConfig = z.infer<typeof EntryConfigSchema>;

// ── Exit execution rules ───────────────────────────────────────────────────────

export const ExitConfigSchema = z.object({
	stop_loss_type: z.string(),
	take_profit_type: z.string(),
	trailing_stop_enabled: z.boolean(),
	time_based_exit_enabled: z.boolean(),
	stop_loss_value: z.number().optional(),
	take_profit_value: z.number().optional(),
	trailing_stop_pct: z.number().optional(),
	max_holding_days: z.number().int().optional()
});

export type ExitConfig = z.infer<typeof ExitConfigSchema>;

// ── Optional pre-screen liquidity filter ──────────────────────────────────────

export const LiquidityFilterSchema = z.object({
	min_avg_volume_20d: z.number().optional(),
	min_market_cap: z.number().optional(),
	min_price: z.number().optional(),
	active_listing_only: z.boolean().optional()
});

export type LiquidityFilter = z.infer<typeof LiquidityFilterSchema>;

// ── Composed strategy configuration ───────────────────────────────────────────

export const StrategyConfigSchema = z.object({
	entry_config: EntryConfigSchema,
	exit_config: ExitConfigSchema,
	liquidity_filter: LiquidityFilterSchema.optional()
});

export type StrategyConfig = z.infer<typeof StrategyConfigSchema>;
