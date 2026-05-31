import { z } from 'zod';

export const SimulatedMetricsSchema = z.object({
	totalReturn: z.number().default(0),
	maxDrawdown: z.number().default(0),
	winRate: z.number().default(0)
});

export const AppStateSchema = z.object({
	backtestPrefillSymbol: z.string().default(''),
	simulatedMetrics: SimulatedMetricsSchema.default({ totalReturn: 0, maxDrawdown: 0, winRate: 0 })
});
