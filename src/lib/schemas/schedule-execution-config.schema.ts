import { z } from 'zod';

export const ScheduleExecutionConfigSchema = z.object({
	startDate: z.string().default('2020-01-01'),
	endDate: z.string().default('2024-12-31'),
	timeframe: z.string().default('Daily'),
	direction: z.enum(['Long', 'Short', 'Both']).default('Long')
});

export type ScheduleExecutionConfig = z.infer<typeof ScheduleExecutionConfigSchema>;
