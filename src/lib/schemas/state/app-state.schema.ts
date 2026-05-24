import { z } from 'zod';

export const AppStateSchema = z.object({
	currentLocale: z.enum(['en', 'zh-TW']).default('en'),
	backtestPrefillSymbol: z.string().default(''),
	simulatedMetrics: z
		.object({
			totalReturn: z.string().default('42.8'),
			maxDrawdown: z.string().default('-18.2'),
			winRate: z.string().default('58.3')
		})
		.default({ totalReturn: '42.8', maxDrawdown: '-18.2', winRate: '58.3' })
});

export type AppStateData = z.infer<typeof AppStateSchema>;
