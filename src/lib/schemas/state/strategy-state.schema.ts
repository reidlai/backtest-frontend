import { z } from 'zod';
import { StrategySchema } from '../types/strategy.schema';

export const StrategyStateSchema = z.object({
	inputText: z.string().default(''),
	parsedStrategy: StrategySchema.nullable().default(null)
});

export type StrategyStateData = z.infer<typeof StrategyStateSchema>;
