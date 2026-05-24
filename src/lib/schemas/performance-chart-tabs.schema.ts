import { z } from 'zod';

export const PerformanceChartTabsSchema = z.object({
	activeChartTab: z
		.enum(['equity-curve', 'drawdown', 'benchmark-overlay', 'monthly-heatmap'])
		.default('equity-curve')
});

export type PerformanceChartTabsState = z.infer<typeof PerformanceChartTabsSchema>;
