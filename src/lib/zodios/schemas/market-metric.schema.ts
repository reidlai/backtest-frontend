/**
 * API-aligned Zod schemas for market metric resources.
 *
 * These schemas match the OpenAPI spec for MarketMetricService endpoints:
 *   GET /v1/market-metrics          → MarketMetricCollectionResultSchema
 *   GET /v1/market-metrics/{symbol} → MarketMetricResultSchema
 *
 * NOTE: This schema is intentionally separate from the UI-centric schema at
 * src/lib/schemas/market-metric.schema.ts which uses a different shape.
 *
 * Feature: 022-rxjs-state-management
 */
import { z } from 'zod';

/**
 * Single market indicator snapshot.
 * Canonical symbols: SP500, NDX100, HSI, VIX, US10Y.
 */
export const MarketMetricResultSchema = z.object({
	symbol: z.string(),
	name: z.string(),
	value: z.number(),
	change: z.number(),
	change_pct: z.number(),
	as_of: z.string(),
	stale: z.boolean()
});

export type MarketMetricResult = z.infer<typeof MarketMetricResultSchema>;

/**
 * Fixed collection of five market indicator snapshots.
 * RID: backtest.market-metric-collection
 */
export const MarketMetricCollectionResultSchema = z.object({
	items: z.array(MarketMetricResultSchema),
	as_of: z.string()
});

export type MarketMetricCollectionResult = z.infer<typeof MarketMetricCollectionResultSchema>;
