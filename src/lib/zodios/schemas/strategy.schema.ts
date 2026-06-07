import { z } from 'zod';
import { StrategyConfigSchema } from './strategy-config.schema.js';
import { pagedSchema } from './_paged.js';

export const StrategyResultSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	version: z.string(),
	status: z.string(),
	config: StrategyConfigSchema
});

export type StrategyResult = z.infer<typeof StrategyResultSchema>;

export const PagedStrategyResultSchema = pagedSchema(StrategyResultSchema);

export type PagedStrategyResult = z.infer<typeof PagedStrategyResultSchema>;
