import { z } from 'zod';
import { TimeSeriesPointSchema } from './time-series-point.schema';
import { MonthlyReturnSchema } from './monthly-return.schema';

export const BacktestResultSchema = z.object({
	totalReturn: z.number(),
	netProfit: z.number(),
	maxDrawdown: z.number(),
	sharpeRatio: z.number(),
	winRate: z.number(),
	profitFactor: z.number(),
	volatility: z.number(),
	exposureTime: z.number(),
	equityCurve: z.array(TimeSeriesPointSchema),
	drawdownSeries: z.array(TimeSeriesPointSchema),
	monthlyReturns: z.array(MonthlyReturnSchema),
	benchmarkSeries: z.array(TimeSeriesPointSchema)
});
