import { z } from 'zod';

export const BacktestParamsSchema = z.object({
	mode: z.enum([
		'Single Stock',
		'Watchlist',
		'Screener Result',
		'Index Universe',
		'Strategy Comparison',
		'Benchmark Comparison'
	]),
	initialCapital: z.number(),
	startDate: z.string(),
	endDate: z.string(),
	market: z.string(),
	universe: z.string(),
	timeframe: z.string(),
	commissionModel: z.string(),
	slippageModel: z.string(),
	positionSize: z.string(),
	stopLoss: z.number(),
	takeProfit: z.number(),
	direction: z.enum(['Long', 'Short', 'Both']),
	rebalanceFrequency: z.string(),
	orderTypes: z.array(
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
});
