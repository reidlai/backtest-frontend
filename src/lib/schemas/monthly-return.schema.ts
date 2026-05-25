import { z } from 'zod';

export const MonthlyReturnSchema = z.object({
	month: z.string(),
	value: z.number()
});
