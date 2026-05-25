import { z } from 'zod';

export const MetricCategorySchema = z.enum(['market', 'risk', 'rates', 'usage']);

export const MarketMetricSchema = z.object({
	id: z.string(),
	label: z.string(),
	value: z.string(),
	delta: z.string(),
	deltaPositive: z.boolean(),
	category: MetricCategorySchema
});
