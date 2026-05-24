import { z } from 'zod';

export const ResourceCostPanelSchema = z.object({});

export type ResourceCostPanelState = z.infer<typeof ResourceCostPanelSchema>;
