import { z } from 'zod';

export const BacktestModeSchema = z.enum([
	'Single Stock',
	'Watchlist',
	'Screener Result',
	'Index Universe',
	'Strategy Comparison',
	'Benchmark Comparison'
]);

export const OrderTypeSchema = z.enum([
	'Market',
	'Limit',
	'Stop',
	'Stop-Limit',
	'Trailing Stop',
	'Bracket',
	'OCO',
	'Short Sell'
]);

export const BacktestStateSchema = z.object({
	mode: BacktestModeSchema.default('Single Stock'),
	initialCapital: z.string().default('100000'),
	startDate: z.string().default('2020-01-01'),
	endDate: z.string().default('2024-12-31'),
	universe: z.string().default('SPY'),
	timeframe: z.string().default('Daily'),
	direction: z.enum(['Long', 'Short', 'Both']).default('Long'),
	selectedOrderTypes: z.array(OrderTypeSchema).default(['Market'])
});
