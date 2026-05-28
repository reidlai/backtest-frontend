import { z } from 'zod';

export const BacktestModeSchema = z.enum([
	'Single Stock',
	'Watchlist',
	'Screener Result',
	'Index Universe',
	'Strategy Comparison',
	'Benchmark Comparison'
]);

export type BacktestMode = z.infer<typeof BacktestModeSchema>;

export const UniverseCapitalConfigSchema = z.object({
	mode: BacktestModeSchema.default('Single Stock'),
	universe: z.string().default('SPY'),
	initialCapital: z.string().default('100000')
});

export type UniverseCapitalConfig = z.infer<typeof UniverseCapitalConfigSchema>;
