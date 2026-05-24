import { z } from 'zod';

export const StubSectionSchema = z.object({
	title: z.string().default('Section')
});

export type StubSectionState = z.infer<typeof StubSectionSchema>;
export type StubSectionProps = z.infer<typeof StubSectionSchema>;
