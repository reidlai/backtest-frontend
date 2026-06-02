import { z } from 'zod';

export const EditMetricModalStateSchema = z.object({
	editValue: z.string().default('')
});

export const EditMetricValueSchema = z
	.string()
	.refine((v) => v.trim() !== '' && !isNaN(parseFloat(v.trim())), {
		message: 'Must be a valid number'
	});

export type EditMetricModalState = z.infer<typeof EditMetricModalStateSchema>;
