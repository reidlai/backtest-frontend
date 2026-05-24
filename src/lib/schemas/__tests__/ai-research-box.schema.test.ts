import { describe, it, expect } from 'vitest';
import { AIResearchBoxSchema } from '../ai-research-box.schema';

describe('AIResearchBoxSchema', () => {
	it('parses empty input with defaults', () => {
		const result = AIResearchBoxSchema.parse({});
		expect(result.aiText).toBe('');
		expect(result.validationError).toBe(false);
	});

	it('accepts provided values', () => {
		const result = AIResearchBoxSchema.parse({ aiText: 'test', validationError: true });
		expect(result.aiText).toBe('test');
		expect(result.validationError).toBe(true);
	});
});
