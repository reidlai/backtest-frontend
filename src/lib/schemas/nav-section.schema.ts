import { z } from 'zod';

export const SectionIdSchema = z.enum([
	'dashboard',
	'strategy-builder',
	'fundamental-screener',
	'technical-screener',
	'backtest-engine',
	'performance-result',
	'market-regime',
	'sentiment-events',
	'trade-log',
	'settings-billing'
]);

export const NavGroupSchema = z.enum(['main', 'result']);

export const NavSectionSchema = z.object({
	id: SectionIdSchema,
	path: z.string(),
	labelKey: z.string(),
	icon: z.string(),
	group: NavGroupSchema
});
