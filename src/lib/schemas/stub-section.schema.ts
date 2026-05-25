import { z } from 'zod';

export const StubSectionSchema = z.object({
	title: z.string().default('Section')
});
