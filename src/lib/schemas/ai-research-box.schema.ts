import { z } from 'zod';

export const AIResearchBoxSchema = z.object({
	aiText: z.string().default(''),
	validationError: z.boolean().default(false)
});

export type AIResearchBoxState = z.infer<typeof AIResearchBoxSchema>;
