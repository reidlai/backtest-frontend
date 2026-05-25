import { z } from 'zod';
import { FunctionGatewayCardSchema } from './function-gateway-card.schema';

export const FunctionGatewaysSchema = z.object({
	gatewayCards: z.array(FunctionGatewayCardSchema).default([])
});

