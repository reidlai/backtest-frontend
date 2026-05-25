import { z } from 'zod';
import { StrategySchema } from './strategy.schema';

export const StrategyStateSchema = z.object({
	inputText: z.string().default(''),
	parsedStrategy: StrategySchema.nullable().default(null)
});

