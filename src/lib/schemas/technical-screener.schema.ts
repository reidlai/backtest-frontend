import { z } from 'zod';

export const TechnicalScreenerSchema = z.object({
	selectedPatterns: z.array(z.string()).default([]),
	trendIndicator: z.string().default('EMA(200)'),
	momentumIndicator: z.string().default('RSI(14)')
});

export type TechnicalScreenerState = z.infer<typeof TechnicalScreenerSchema>;
