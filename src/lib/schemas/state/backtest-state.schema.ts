import { z } from 'zod';

export const BacktestStateSchema = z.object({
	mode: z
		.enum([
			'Single Stock',
			'Watchlist',
			'Screener Result',
			'Index Universe',
			'Strategy Comparison',
			'Benchmark Comparison'
		])
		.default('Single Stock'),
	initialCapital: z.string().default('100000'),
	startDate: z.string().default('2020-01-01'),
	endDate: z.string().default('2024-12-31'),
	universe: z.string().default('SPY'),
	timeframe: z.string().default('Daily'),
	direction: z.enum(['Long', 'Short', 'Both']).default('Long'),
	selectedOrderTypes: z
		.array(
			z.enum([
				'Market',
				'Limit',
				'Stop',
				'Stop-Limit',
				'Trailing Stop',
				'Bracket',
				'OCO',
				'Short Sell'
			])
		)
		.default(['Market'])
});

export type BacktestStateData = z.infer<typeof BacktestStateSchema>;
