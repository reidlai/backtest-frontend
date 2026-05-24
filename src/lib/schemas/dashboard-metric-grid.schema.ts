import { z } from 'zod';
import type { MarketMetric } from '$lib/types';

export const DashboardMetricGridSchema = z.object({
	metrics: z.custom<MarketMetric[]>().default([])
});

export type DashboardMetricGridState = z.infer<typeof DashboardMetricGridSchema>;
