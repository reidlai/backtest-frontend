import { z } from 'zod';
import { ResourceUsageSchema } from './resource-usage.schema';

export const ResourceCostPanelSchema = z.object({
	resourceUsage: ResourceUsageSchema.default({
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
