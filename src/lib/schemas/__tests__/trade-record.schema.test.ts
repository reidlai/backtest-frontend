/**
 * Updated for feature 021-zodios-api-client: migrated from camelCase to snake_case
 * OpenAPI-aligned fields. Removed: commission, slippage, holdingDays, direction.
 * Renamed: tradeId→trade_id, direction→side, entryDate→entry_timestamp,
 *   exitDate→exit_timestamp, entryPrice→entry_price, exitPrice→exit_price,
 *   netPnl→pnl_absolute, returnPct→pnl_pct.
 * Added: exit_reason (optional), symbol (retained), quantity (retained).
 */
import { describe, it, expect } from 'vitest';
import { TradeRecordSchema } from '../trade-record.schema';

const validTrade = {
	trade_id: 'T-001',
	symbol: 'AAPL',
	side: 'LONG',
	entry_timestamp: '2023-01-15T09:30:00Z',
	entry_price: 135.21,
	exit_timestamp: '2023-02-10T16:00:00Z',
	exit_price: 151.05,
	quantity: 100,
	pnl_absolute: 1578.75,
	pnl_pct: 11.72,
	exit_reason: 'TAKE_PROFIT'
};

describe('TradeRecordSchema (re-export from $lib/zodios/schemas/trade-record.schema)', () => {
	it('parses a valid trade record with snake_case OpenAPI fields', () => {
		const result = TradeRecordSchema.safeParse(validTrade);
		expect(result.success).toBe(true);
	});

	it('parses a trade without exit_reason (optional field)', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { exit_reason: _, ...withoutExitReason } = validTrade;
		const result = TradeRecordSchema.safeParse(withoutExitReason);
		expect(result.success).toBe(true);
	});

	it('rejects a record missing the required symbol field', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, symbol: undefined });
		expect(result.success).toBe(false);
	});

	it('rejects a record missing the required trade_id field', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, trade_id: undefined });
		expect(result.success).toBe(false);
	});

	it('rejects non-number entry_price', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, entry_price: '135.21' });
		expect(result.success).toBe(false);
	});

	it('rejects non-number pnl_absolute', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, pnl_absolute: null });
		expect(result.success).toBe(false);
	});

	it('accepts SHORT as a valid side value', () => {
		const result = TradeRecordSchema.safeParse({ ...validTrade, side: 'SHORT' });
		expect(result.success).toBe(true);
	});

	it('rejects old camelCase field names (migration guard)', () => {
		// After migration: camelCase fields are no longer valid
		const oldFormat = {
			tradeId: 'T-001',
			symbol: 'AAPL',
			direction: 'Long',
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
		// Old format is missing required snake_case fields → parse fails
		const result = TradeRecordSchema.safeParse(oldFormat);
		expect(result.success).toBe(false);
	});
});
