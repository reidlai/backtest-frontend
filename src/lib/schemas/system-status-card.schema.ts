import { z } from 'zod';

export const SystemStatusCardSchema = z.object({
	queuePosition: z.number().int().nonnegative().default(0),
	complexityScore: z.number().min(0).max(100).default(0),
	estimatedRuntime: z.string().min(1).default('N/A')
});

export type SystemStatusCardState = z.infer<typeof SystemStatusCardSchema>;
