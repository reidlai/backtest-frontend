import { z } from 'zod';
import type { ResourceUsage } from '$lib/types';

export const ResourceCostPanelSchema = z.object({
	resourceUsage: z.custom<ResourceUsage>().default({
		tokensUsed: 4250,
		tokensTotal: 10000,
		backtestsUsed: 3,
		backtestsTotal: 10,
		queuePosition: 0,
		estimatedRuntime: '~42s',
		complexityScore: 67,
		planImpact: 'medium'
	})
});

export type ResourceCostPanelState = z.infer<typeof ResourceCostPanelSchema>;
