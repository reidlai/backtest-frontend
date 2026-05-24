import { z } from 'zod';
import { MetricTileSchema } from './types/metric-tile.schema';

export const PerformanceMetricGridSchema = z.object({
	tiles: z.array(MetricTileSchema).default([]),
	draggedIndex: z.number().nullable().default(null),
	editingTileId: z.string().nullable().default(null),
	editValue: z.string().default(''),
	modalOpen: z.boolean().default(false)
});

export type PerformanceMetricGridState = z.infer<typeof PerformanceMetricGridSchema>;
