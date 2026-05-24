import { z } from 'zod';
import { FunctionGatewayCardSchema } from './types/function-gateway-card.schema';

export const FunctionGatewaysSchema = z.object({
	gatewayCards: z.array(FunctionGatewayCardSchema).default([])
});

export type FunctionGatewaysState = z.infer<typeof FunctionGatewaysSchema>;
