import { z } from 'zod';
import { ChatMessageSchema } from './chat-message.schema';

export const AIChatPanelSchema = z.object({
	chatInput: z.string().default(''),
	messages: z.array(ChatMessageSchema).default([])
});

