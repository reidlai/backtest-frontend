import { z } from 'zod';

export const FlagSeveritySchema = z.enum(['high', 'medium', 'low']);

export const RiskFlagSchema = z.object({
	id: z.string(),
	label: z.string(),
	severity: FlagSeveritySchema,
	description: z.string()
});
