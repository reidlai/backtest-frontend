import { z } from 'zod';

export const UsageMetricSchema = z.object({
	id: z.string(),
	label: z.string(),
	value: z.string(),
	description: z.string().optional()
});
