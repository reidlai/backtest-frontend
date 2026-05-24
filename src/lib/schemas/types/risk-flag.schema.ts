import { z } from 'zod';

export const RiskFlagSchema = z.object({
	id: z.string(),
	label: z.string(),
	severity: z.enum(['high', 'medium', 'low']),
	description: z.string()
});

export type RiskFlag = z.infer<typeof RiskFlagSchema>;
