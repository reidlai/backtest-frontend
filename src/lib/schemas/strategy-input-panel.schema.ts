import { z } from 'zod';

export const StrategyInputPanelSchema = z.object({
	inputText: z.string().default(''),
	isRunning: z.boolean().default(false)
});
