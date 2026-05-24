import { z } from 'zod';

export const QuickActionsPanelSchema = z.object({});

export type QuickActionsPanelState = z.infer<typeof QuickActionsPanelSchema>;
