import { z } from 'zod';

/**
 * Generic paginated wrapper factory.
 * Used by PagedStrategyResult, PagedBacktestRunResult, and PagedBacktestResultResource.
 */
export const pagedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		total: z.number().int(),
		offset: z.number().int().optional(),
		limit: z.number().int().optional(),
		items: z.array(itemSchema)
	});
