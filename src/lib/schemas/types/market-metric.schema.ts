import { z } from 'zod';

export const MarketMetricSchema = z.object({
	id: z.string(),
	label: z.string(),
	value: z.string(),
	delta: z.string(),
	deltaPositive: z.boolean(),
	category: z.enum(['market', 'risk', 'rates', 'usage'])
});

export type MarketMetric = z.infer<typeof MarketMetricSchema>;
