import { z } from 'zod';
import { SectionIdSchema } from './nav-section.schema';

export const FunctionGatewayCardSchema = z.object({
	id: SectionIdSchema,
	titleKey: z.string(),
	descriptionKey: z.string(),
	icon: z.string()
});

