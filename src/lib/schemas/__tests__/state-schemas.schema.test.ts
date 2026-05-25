import { describe, it, expect } from 'vitest';
import { AppStateSchema } from '../app-state.schema';
import { BacktestStateSchema } from '../backtest-state.schema';
import { StrategyStateSchema } from '../strategy-state.schema';
import { LiveControlFormSchema } from '../live-control-form.schema';

describe('AppStateSchema', () => {
	it('parse({}) returns expected defaults', () => {
		const result = AppStateSchema.parse({});
		expect(result).toEqual({
			backtestPrefillSymbol: ''
		});
	});
});

describe('BacktestStateSchema', () => {
	it('parse({}) returns expected defaults', () => {
		const result = BacktestStateSchema.parse({});
		expect(result.mode).toBe('Single Stock');
		expect(result.initialCapital).toBe('100000');
		expect(result.startDate).toBe('2020-01-01');
		expect(result.endDate).toBe('2024-12-31');
		expect(result.universe).toBe('SPY');
		expect(result.timeframe).toBe('Daily');
		expect(result.direction).toBe('Long');
		expect(result.selectedOrderTypes).toEqual(['Market']);
	});

	it('rejects invalid mode', () => {
		const result = BacktestStateSchema.safeParse({ mode: 'InvalidMode' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid direction', () => {
		const result = BacktestStateSchema.safeParse({ direction: 'Up' });
		expect(result.success).toBe(false);
	});
});

describe('LiveControlFormSchema', () => {
	it('parse({}) returns expected defaults', () => {
		const result = LiveControlFormSchema.parse({});
		expect(result).toEqual({
			totalReturn: '42.8',
			maxDrawdown: '-18.2',
			winRate: '58.3'
		});
	});
});

describe('StrategyStateSchema', () => {
	it('parse({}) returns expected defaults', () => {
		const result = StrategyStateSchema.parse({});
		expect(result).toEqual({ inputText: '', parsedStrategy: null });
	});

	it('rejects invalid parsedStrategy shape', () => {
		const result = StrategyStateSchema.safeParse({ parsedStrategy: { market: 123 } });
		expect(result.success).toBe(false);
	});
});
