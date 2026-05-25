import { z } from 'zod';

export const RegimeBreakdownSchema = z.object({
	regime: z.string(),
	returnPct: z.number(),
	maxDrawdown: z.number(),
	winRate: z.number(),
	tradeCount: z.number()
});
