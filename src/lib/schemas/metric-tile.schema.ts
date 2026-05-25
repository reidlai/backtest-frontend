import { z } from 'zod';

export const MetricTileSchema = z.object({
	id: z.string(),
	label: z.string(),
	value: z.string(),
	unit: z.string(),
	order: z.number()
});

