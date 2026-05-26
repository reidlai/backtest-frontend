import { z } from 'zod';

export const FundamentalScreenerSchema = z.object({
	universe: z.string().default('S&P 500'),
	peMax: z.string().default('30'),
	roicMin: z.string().default('15'),
	revGrowthMin: z.string().default('10')
});

export type FundamentalScreenerState = z.infer<typeof FundamentalScreenerSchema>;
