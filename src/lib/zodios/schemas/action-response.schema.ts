import { z } from 'zod';

export const ActionResponseSchema = z.object({
	run_id: z.string().uuid(),
	status: z.string()
});

export type ActionResponse = z.infer<typeof ActionResponseSchema>;
