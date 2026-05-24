import { z } from 'zod';

export const AIReviewSidebarSchema = z.object({});

export type AIReviewSidebarState = z.infer<typeof AIReviewSidebarSchema>;
