import { z } from 'zod';

export const TimeSeriesPointSchema = z.object({
	date: z.string(),
	value: z.number()
});
