import { z } from 'zod';

export const PerfSummaryItemSchema = z.object({
	label: z.string(),
	value: z.string()
});

export type PerfSummaryItem = z.infer<typeof PerfSummaryItemSchema>;
