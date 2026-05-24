import { z } from 'zod';

export const MonthlyReturnSchema = z.object({
	month: z.string(),
	value: z.number()
});

export type MonthlyReturn = z.infer<typeof MonthlyReturnSchema>;
