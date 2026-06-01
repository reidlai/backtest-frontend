import { describe, it, expect } from 'vitest';
import { TradeRecordSchema } from '../trade-record.schema';

const validTrade = {
	tradeId: 'T-001',
	symbol: 'AAPL',
	direction: 'Long' as const,
	entryDate: '2023-01-15',
	entryPrice: 135.21,
	exitDate: '2023-02-10',
	exitPrice: 151.05,
	quantity: 100,
	commission: 5.0,
	slippage: 1.25,
	netPnl: 1578.75,
	returnPct: 11.72,
	holdingDays: 26,
	exitReason: 'Target Hit'
};

describe('TradeRecordSchema', () => {
	it('parses a valid trade record', () => {
		const result = TradeRecordSchema.safeParse(validTrade);
		expect(result.success).toBe(true);
	});

	it('rejects a record missing a required field', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, symbol: undefined });
		expect(result.success).toBe(false);
	});

	it('rejects direction value other than Long or Short', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, direction: 'Buy' });
		expect(result.success).toBe(false);
	});

	it('rejects non-number value for entryPrice', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, entryPrice: '135.21' });
		expect(result.success).toBe(false);
	});

	it('rejects non-number value for netPnl', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, netPnl: null });
		expect(result.success).toBe(false);
	});

	it('accepts Short as a valid direction', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, direction: 'Short' });
		expect(result.success).toBe(true);
	});

	it('rejects record with non-number holdingDays', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, holdingDays: '26' });
		expect(result.success).toBe(false);
	});
});
