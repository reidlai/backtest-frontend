import { z } from 'zod';

export const RegimeStatusSchema = z.enum(['active', 'inactive', 'warning']);

export const MarketRegimeSchema = z.object({
	id: z.string(),
	name: z.string(),
	status: RegimeStatusSchema,
	logicDescription: z.string(),
	indicators: z.array(z.string())
});
