import { describe, it, expect } from 'vitest';
import { PerformanceMetricGridSchema } from '../performance-metric-grid.schema';

describe('PerformanceMetricGridSchema', () => {
	it('parses empty input with defaults', () => {
		const result = PerformanceMetricGridSchema.parse({});
		expect(result.tiles).toEqual([]);
		expect(result.draggedIndex).toBeNull();
		expect(result.editingTileId).toBeNull();
		expect(result.editValue).toBe('');
		expect(result.modalOpen).toBe(false);
	});

	it('accepts partial state override', () => {
		const result = PerformanceMetricGridSchema.parse({ modalOpen: true, editValue: 'abc' });
		expect(result.modalOpen).toBe(true);
		expect(result.editValue).toBe('abc');
	});
});
