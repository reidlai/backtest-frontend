import { z } from 'zod';

export const ChartTabSchema = z.enum([
	'equity-curve',
	'drawdown',
	'benchmark-overlay',
	'monthly-heatmap'
]);

export const PerformanceChartTabsSchema = z.object({
	activeChartTab: ChartTabSchema.default('equity-curve')
});
