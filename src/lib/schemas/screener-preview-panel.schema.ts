import { z } from 'zod';

export const ScreenerPreviewPanelSchema = z.object({
	ticker: z.string().default('AAPL'),
	chartData: z
		.array(
			z.object({
				date: z.date(),
				value: z.number()
			})
		)
		.default([])
});

export type ScreenerPreviewPanelState = z.infer<typeof ScreenerPreviewPanelSchema>;
