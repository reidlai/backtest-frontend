import { z } from 'zod';

export const PlanImpactSchema = z.enum(['low', 'medium', 'high']);

export const ResourceUsageSchema = z.object({
	tokensUsed: z.number(),
	tokensTotal: z.number(),
	backtestsUsed: z.number(),
	backtestsTotal: z.number(),
	queuePosition: z.number(),
	estimatedRuntime: z.string(),
	complexityScore: z.number(),
	planImpact: PlanImpactSchema
});
