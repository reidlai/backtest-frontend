import { z } from 'zod';
import { ChatMessageSchema } from './types/chat-message.schema';

export const AIChatPanelSchema = z.object({
	chatInput: z.string().default(''),
	messages: z.array(ChatMessageSchema).default([])
});

export type AIChatPanelState = z.infer<typeof AIChatPanelSchema>;
