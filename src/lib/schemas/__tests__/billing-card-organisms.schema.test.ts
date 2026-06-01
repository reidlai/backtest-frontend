import { describe, it, expect } from 'vitest';
import { TokenUsageCardSchema } from '../token-usage-card.schema';
import { BacktestRunsCardSchema } from '../backtest-runs-card.schema';
import { SystemStatusCardSchema } from '../system-status-card.schema';

// ---------------------------------------------------------------------------
// TokenUsageCardSchema
// ---------------------------------------------------------------------------

describe('TokenUsageCardSchema', () => {
	it('parses empty input with defaults', () => {
		const result = TokenUsageCardSchema.parse({});
		expect(result.tokensUsed).toBe(0);
		expect(result.tokensTotal).toBe(10000);
	});

	it('accepts valid used ≤ total', () => {
		const result = TokenUsageCardSchema.parse({ tokensUsed: 4250, tokensTotal: 10000 });
		expect(result.tokensUsed).toBe(4250);
		expect(result.tokensTotal).toBe(10000);
	});

	it('accepts used === total (100% quota)', () => {
		const result = TokenUsageCardSchema.parse({ tokensUsed: 10000, tokensTotal: 10000 });
		expect(result.tokensUsed).toBe(10000);
	});

	it('rejects used > total', () => {
		const result = TokenUsageCardSchema.safeParse({ tokensUsed: 15000, tokensTotal: 10000 });
		expect(result.success).toBe(false);
	});

	it('rejects negative tokensUsed', () => {
		const result = TokenUsageCardSchema.safeParse({ tokensUsed: -1, tokensTotal: 10000 });
		expect(result.success).toBe(false);
	});

	it('rejects non-integer tokensUsed', () => {
		const result = TokenUsageCardSchema.safeParse({ tokensUsed: 1.5, tokensTotal: 10000 });
		expect(result.success).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// BacktestRunsCardSchema
// ---------------------------------------------------------------------------

describe('BacktestRunsCardSchema', () => {
	it('parses empty input with defaults', () => {
		const result = BacktestRunsCardSchema.parse({});
		expect(result.backtestsUsed).toBe(0);
		expect(result.backtestsTotal).toBe(10);
		expect(result.planName).toBe('Pro Plan');
	});

	it('accepts valid data with plan name', () => {
		const result = BacktestRunsCardSchema.parse({
			backtestsUsed: 3,
			backtestsTotal: 10,
			planName: 'Enterprise'
		});
		expect(result.planName).toBe('Enterprise');
	});

	it('accepts used === total', () => {
		const result = BacktestRunsCardSchema.parse({
			backtestsUsed: 10,
			backtestsTotal: 10,
			planName: 'Pro Plan'
		});
		expect(result.backtestsUsed).toBe(10);
	});

	it('rejects used > total', () => {
		const result = BacktestRunsCardSchema.safeParse({
			backtestsUsed: 12,
			backtestsTotal: 10,
			planName: 'Pro Plan'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty planName', () => {
		const result = BacktestRunsCardSchema.safeParse({
			backtestsUsed: 1,
			backtestsTotal: 10,
			planName: ''
		});
		expect(result.success).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// SystemStatusCardSchema
// ---------------------------------------------------------------------------

describe('SystemStatusCardSchema', () => {
	it('parses empty input with defaults', () => {
		const result = SystemStatusCardSchema.parse({});
		expect(result.queuePosition).toBe(0);
		expect(result.complexityScore).toBe(0);
		expect(result.estimatedRuntime).toBe('N/A');
	});

	it('accepts valid data', () => {
		const result = SystemStatusCardSchema.parse({
			queuePosition: 2,
			complexityScore: 67,
			estimatedRuntime: '~42s'
		});
		expect(result.complexityScore).toBe(67);
	});

	it('accepts boundary complexityScore of 0', () => {
		const result = SystemStatusCardSchema.parse({
			queuePosition: 0,
			complexityScore: 0,
			estimatedRuntime: 'N/A'
		});
		expect(result.complexityScore).toBe(0);
	});

	it('accepts boundary complexityScore of 100', () => {
		const result = SystemStatusCardSchema.parse({
			queuePosition: 0,
			complexityScore: 100,
			estimatedRuntime: 'N/A'
		});
		expect(result.complexityScore).toBe(100);
	});

	it('rejects complexityScore above 100', () => {
		const result = SystemStatusCardSchema.safeParse({
			queuePosition: 1,
			complexityScore: 150,
			estimatedRuntime: '~10s'
		});
		expect(result.success).toBe(false);
	});

	it('rejects complexityScore below 0', () => {
		const result = SystemStatusCardSchema.safeParse({
			queuePosition: 1,
			complexityScore: -5,
			estimatedRuntime: '~10s'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty estimatedRuntime', () => {
		const result = SystemStatusCardSchema.safeParse({
			queuePosition: 1,
			complexityScore: 50,
			estimatedRuntime: ''
		});
		expect(result.success).toBe(false);
	});
});
