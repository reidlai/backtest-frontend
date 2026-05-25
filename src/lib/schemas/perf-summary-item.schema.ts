import { z } from 'zod';

export const PerfSummaryItemSchema = z.object({
	label: z.string(),
	value: z.string()
});

