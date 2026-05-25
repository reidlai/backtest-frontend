import { z } from 'zod';

export const ScreenerResultSchema = z.object({
	symbol: z.string(),
	name: z.string(),
	peRatio: z.number(),
	evEbitda: z.number(),
	fcfYield: z.number(),
	roic: z.number(),
	revenueGrowth: z.number(),
	epsGrowth: z.number(),
	score: z.number()
});

