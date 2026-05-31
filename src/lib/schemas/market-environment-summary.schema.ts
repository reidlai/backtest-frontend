import { z } from 'zod';

export const MarketEnvironmentSummarySchema = z.object({
	summary: z.string().default('')
});
