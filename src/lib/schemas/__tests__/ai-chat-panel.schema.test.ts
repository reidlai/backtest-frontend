import { describe, it, expect } from 'vitest';
import { AIChatPanelSchema } from '../ai-chat-panel.schema';

describe('AIChatPanelSchema', () => {
	it('parses empty input with defaults', () => {
		const result = AIChatPanelSchema.parse({});
		expect(result.chatInput).toBe('');
		expect(result.messages).toEqual([]);
	});

	it('accepts provided values', () => {
		const result = AIChatPanelSchema.parse({ chatInput: 'hello' });
		expect(result.chatInput).toBe('hello');
	});
});
