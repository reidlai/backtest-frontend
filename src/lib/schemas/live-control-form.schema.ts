import { z } from 'zod';

export const LiveControlFormSchema = z.object({
	totalReturn: z.string().default('42.8'),
	maxDrawdown: z.string().default('-18.2'),
	winRate: z.string().default('58.3')
});
