/**
 * Shared mock trade data — migrated to OpenAPI snake_case fields for feature
 * 021-zodios-api-client.
 *
 * Renamed: tradeId→trade_id, direction→side (LONG/SHORT), entryDate→entry_timestamp,
 *   entryPrice→entry_price, exitDate→exit_timestamp, exitPrice→exit_price,
 *   netPnl→pnl_absolute, returnPct→pnl_pct, exitReason→exit_reason.
 * Removed: commission, slippage, holdingDays.
 */
import { z } from 'zod';
import { TradeRecordSchema } from '$lib/schemas';

type TradeRecord = z.infer<typeof TradeRecordSchema>;

export const sampleTrades: TradeRecord[] = [
	{
		trade_id: 'T-001',
		symbol: 'AAPL',
		side: 'LONG',
		entry_timestamp: '2023-01-15T00:00:00Z',
		entry_price: 135.21,
		exit_timestamp: '2023-02-10T00:00:00Z',
		exit_price: 151.05,
		quantity: 100,
		pnl_absolute: 1578.75,
		pnl_pct: 11.72,
		exit_reason: 'Target Hit'
	},
	{
		trade_id: 'T-002',
		symbol: 'MSFT',
		side: 'LONG',
		entry_timestamp: '2023-02-12T00:00:00Z',
		entry_price: 248.16,
		exit_timestamp: '2023-03-05T00:00:00Z',
		exit_price: 255.22,
		quantity: 50,
		pnl_absolute: 347.15,
		pnl_pct: 2.84,
		exit_reason: 'Signal'
	},
	{
		trade_id: 'T-003',
		symbol: 'NVDA',
		side: 'SHORT',
		entry_timestamp: '2023-03-10T00:00:00Z',
		entry_price: 232.45,
		exit_timestamp: '2023-03-15T00:00:00Z',
		exit_price: 245.12,
		quantity: 40,
		pnl_absolute: -513.9,
		pnl_pct: -5.45,
		exit_reason: 'Stop Loss'
	},
	{
		trade_id: 'T-004',
		symbol: 'GOOGL',
		side: 'LONG',
		entry_timestamp: '2023-04-05T00:00:00Z',
		entry_price: 104.12,
		exit_timestamp: '2023-05-20T00:00:00Z',
		exit_price: 122.35,
		quantity: 150,
		pnl_absolute: 2728.0,
		pnl_pct: 17.51,
		exit_reason: 'Trailing Stop'
	},
	{
		trade_id: 'T-005',
		symbol: 'META',
		side: 'LONG',
		entry_timestamp: '2023-06-01T00:00:00Z',
		entry_price: 264.52,
		exit_timestamp: '2023-07-15T00:00:00Z',
		exit_price: 312.45,
		quantity: 30,
		pnl_absolute: 1431.1,
		pnl_pct: 18.12,
		exit_reason: 'Target Hit'
	},
	{
		trade_id: 'T-006',
		symbol: 'TSLA',
		side: 'SHORT',
		entry_timestamp: '2023-08-10T00:00:00Z',
		entry_price: 242.15,
		exit_timestamp: '2023-08-25T00:00:00Z',
		exit_price: 215.42,
		quantity: 50,
		pnl_absolute: 1330.5,
		pnl_pct: 11.04,
		exit_reason: 'Signal'
	},
	{
		trade_id: 'T-007',
		symbol: 'AMZN',
		side: 'LONG',
		entry_timestamp: '2023-09-05T00:00:00Z',
		entry_price: 138.12,
		exit_timestamp: '2023-09-10T00:00:00Z',
		exit_price: 132.45,
		quantity: 80,
		pnl_absolute: -459.7,
		pnl_pct: -4.11,
		exit_reason: 'Stop Loss'
	},
	{
		trade_id: 'T-008',
		symbol: 'NFLX',
		side: 'LONG',
		entry_timestamp: '2023-10-15T00:00:00Z',
		entry_price: 355.21,
		exit_timestamp: '2023-11-20T00:00:00Z',
		exit_price: 478.12,
		quantity: 20,
		pnl_absolute: 2451.2,
		pnl_pct: 34.6,
		exit_reason: 'Signal'
	},
	{
		trade_id: 'T-009',
		symbol: 'AMD',
		side: 'LONG',
		entry_timestamp: '2023-12-01T00:00:00Z',
		entry_price: 118.25,
		exit_timestamp: '2024-01-10T00:00:00Z',
		exit_price: 145.12,
		quantity: 60,
		pnl_absolute: 1606.0,
		pnl_pct: 22.72,
		exit_reason: 'End of Period'
	},
	{
		trade_id: 'T-010',
		symbol: 'NVDA',
		side: 'LONG',
		entry_timestamp: '2024-02-15T00:00:00Z',
		entry_price: 725.12,
		exit_timestamp: '2024-03-20T00:00:00Z',
		exit_price: 912.45,
		quantity: 10,
		pnl_absolute: 1868.1,
		pnl_pct: 25.83,
		exit_reason: 'Signal'
	},
	{
		trade_id: 'T-011',
		symbol: 'AAPL',
		side: 'SHORT',
		entry_timestamp: '2024-04-01T00:00:00Z',
		entry_price: 175.21,
		exit_timestamp: '2024-04-15T00:00:00Z',
		exit_price: 168.12,
		quantity: 100,
		pnl_absolute: 702.5,
		pnl_pct: 4.05,
		exit_reason: 'Signal'
	},
	{
		trade_id: 'T-012',
		symbol: 'MSFT',
		side: 'LONG',
		entry_timestamp: '2024-05-10T00:00:00Z',
		entry_price: 412.45,
		exit_timestamp: '2024-06-05T00:00:00Z',
		exit_price: 432.12,
		quantity: 25,
		pnl_absolute: 484.65,
		pnl_pct: 4.77,
		exit_reason: 'Target Hit'
	},
	{
		trade_id: 'T-013',
		symbol: 'GOOGL',
		side: 'LONG',
		entry_timestamp: '2024-07-01T00:00:00Z',
		entry_price: 182.15,
		exit_timestamp: '2024-07-10T00:00:00Z',
		exit_price: 175.21,
		quantity: 60,
		pnl_absolute: -423.2,
		pnl_pct: -3.81,
		exit_reason: 'Stop Loss'
	},
	{
		trade_id: 'T-014',
		symbol: 'META',
		side: 'LONG',
		entry_timestamp: '2024-08-15T00:00:00Z',
		entry_price: 525.12,
		exit_timestamp: '2024-09-20T00:00:00Z',
		exit_price: 565.42,
		quantity: 15,
		pnl_absolute: 596.3,
		pnl_pct: 7.67,
		exit_reason: 'Signal'
	},
	{
		trade_id: 'T-015',
		symbol: 'TSLA',
		side: 'LONG',
		entry_timestamp: '2024-10-01T00:00:00Z',
		entry_price: 245.12,
		exit_timestamp: '2024-10-15T00:00:00Z',
		exit_price: 221.05,
		quantity: 40,
		pnl_absolute: -969.95,
		pnl_pct: -9.82,
		exit_reason: 'Stop Loss'
	},
	{
		trade_id: 'T-016',
		symbol: 'AVGO',
		side: 'LONG',
		entry_timestamp: '2024-11-05T00:00:00Z',
		entry_price: 1245.12,
		exit_timestamp: '2024-12-10T00:00:00Z',
		exit_price: 1412.45,
		quantity: 5,
		pnl_absolute: 819.15,
		pnl_pct: 13.44,
		exit_reason: 'End of Period'
	},
	{
		trade_id: 'T-017',
		symbol: 'COST',
		side: 'LONG',
		entry_timestamp: '2024-12-15T00:00:00Z',
		entry_price: 655.21,
		exit_timestamp: '2024-12-31T00:00:00Z',
		exit_price: 682.45,
		quantity: 10,
		pnl_absolute: 263.2,
		pnl_pct: 4.16,
		exit_reason: 'End of Period'
	},
	{
		trade_id: 'T-018',
		symbol: 'NVDA',
		side: 'LONG',
		entry_timestamp: '2024-12-20T00:00:00Z',
		entry_price: 125.12,
		exit_timestamp: '2024-12-31T00:00:00Z',
		exit_price: 148.25,
		quantity: 100,
		pnl_absolute: 2306.5,
		pnl_pct: 18.49,
		exit_reason: 'End of Period'
	}
];

export const tradesToCsv = (trades: TradeRecord[]): string => {
	const header =
		'Trade ID,Symbol,Side,Entry Timestamp,Entry Price,Exit Timestamp,Exit Price,Quantity,PnL ($),Return %,Exit Reason';
	const rows = trades.map((t) =>
		[
			t.trade_id,
			t.symbol,
			t.side,
			t.entry_timestamp,
			t.entry_price,
			t.exit_timestamp,
			t.exit_price,
			t.quantity,
			t.pnl_absolute,
			t.pnl_pct,
			t.exit_reason ?? ''
		].join(',')
	);
	return [header, ...rows].join('\n');
};
