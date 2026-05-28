import { z } from 'zod';

export const OrderTypeSchema = z.enum([
	'Market',
	'Limit',
	'Stop',
	'Stop-Limit',
	'Trailing Stop',
	'Bracket',
	'OCO',
	'Short Sell'
]);

export type OrderType = z.infer<typeof OrderTypeSchema>;

export const OrderTypesConfigSchema = z.object({
	selectedOrderTypes: z.array(OrderTypeSchema).default(['Market'])
});

export type OrderTypesConfig = z.infer<typeof OrderTypesConfigSchema>;
