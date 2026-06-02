import { z } from 'zod';
import { PerfSummaryItemSchema } from './perf-summary-item.schema';

export const PerformanceSummarySchema = z.object({
	stats: z.array(PerfSummaryItemSchema).default([])
});

export type PerformanceSummary = z.infer<typeof PerformanceSummarySchema>;
