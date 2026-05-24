import { z } from 'zod';

export const MarketRegimeSchema = z.object({
	id: z.string(),
	name: z.string(),
	status: z.enum(['active', 'inactive', 'warning']),
	logicDescription: z.string(),
	indicators: z.array(z.string())
});

export type MarketRegime = z.infer<typeof MarketRegimeSchema>;
