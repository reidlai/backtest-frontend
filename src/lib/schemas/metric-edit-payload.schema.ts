import { z } from 'zod';

export const MetricEditPayloadSchema = z.object({
	tileId: z.string(),
	newValue: z.string()
});
