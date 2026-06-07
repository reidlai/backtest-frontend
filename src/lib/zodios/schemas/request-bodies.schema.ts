import { z } from 'zod';
import { BacktestConfigSchema } from './backtest-run.schema.js';
import { StrategyConfigSchema } from './strategy-config.schema.js';

// ── POST /v1/backtest-runs ─────────────────────────────────────────────────────

export const BacktestRunServiceCreateRequestBodySchema = z.object({
	strategy_ids: z.array(z.string()),
	strategy_versions: z.array(z.string()),
	config: BacktestConfigSchema
});

export type BacktestRunServiceCreateRequestBody = z.infer<
	typeof BacktestRunServiceCreateRequestBodySchema
>;

// ── POST /v1/strategies (upsert) ──────────────────────────────────────────────

export const StrategyServiceUpsertRequestBodySchema = z.object({
	name: z.string(),
	config: StrategyConfigSchema
});

export type StrategyServiceUpsertRequestBody = z.infer<
	typeof StrategyServiceUpsertRequestBodySchema
>;

// ── PUT /v1/strategies/{id} (full replace) ────────────────────────────────────

export const StrategyServiceReplaceRequestBodySchema = z.object({
	name: z.string(),
	config: StrategyConfigSchema
});

export type StrategyServiceReplaceRequestBody = z.infer<
	typeof StrategyServiceReplaceRequestBodySchema
>;

// ── PATCH /v1/strategies/{id} (partial update) ────────────────────────────────

export const StrategyServicePatchRequestBodySchema = z.object({
	name: z.string().optional(),
	config: StrategyConfigSchema.partial().optional()
});

export type StrategyServicePatchRequestBody = z.infer<typeof StrategyServicePatchRequestBodySchema>;
