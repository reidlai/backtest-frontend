import { z } from 'zod';

export const ResourceUsageSchema = z.object({
	tokensUsed: z.number(),
	tokensTotal: z.number(),
	backtestsUsed: z.number(),
	backtestsTotal: z.number(),
	queuePosition: z.number(),
	estimatedRuntime: z.string(),
	complexityScore: z.number(),
	planImpact: z.enum(['low', 'medium', 'high'])
});

export type ResourceUsage = z.infer<typeof ResourceUsageSchema>;
