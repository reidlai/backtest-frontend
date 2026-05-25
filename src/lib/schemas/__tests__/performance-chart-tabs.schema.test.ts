import { describe, it, expect } from 'vitest';
import { PerformanceChartTabsSchema } from '../performance-chart-tabs.schema';

describe('PerformanceChartTabsSchema', () => {
	it('parses empty input with default activeChartTab', () => {
		const result = PerformanceChartTabsSchema.parse({});
		expect(result.activeChartTab).toBe('equity-curve');
	});

	it('accepts valid enum values', () => {
		const tabs = ['equity-curve', 'drawdown', 'benchmark-overlay', 'monthly-heatmap'] as const;
		for (const tab of tabs) {
			const result = PerformanceChartTabsSchema.parse({ activeChartTab: tab });
			expect(result.activeChartTab).toBe(tab);
		}
	});

	it('rejects invalid enum value', () => {
		const result = PerformanceChartTabsSchema.safeParse({ activeChartTab: 'invalid-tab' });
		expect(result.success).toBe(false);
	});
});
