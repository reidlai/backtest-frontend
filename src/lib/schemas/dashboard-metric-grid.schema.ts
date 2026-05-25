import { z } from 'zod';
import { MarketMetricSchema } from './market-metric.schema';

export const DashboardMetricGridSchema = z.object({
	metrics: z.array(MarketMetricSchema).default([])
});
