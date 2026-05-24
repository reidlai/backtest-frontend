import { describe, it, expect } from 'vitest';
import { AppStateSchema } from '../state/app-state.schema';
import { BacktestStateSchema } from '../state/backtest-state.schema';
import { StrategyStateSchema } from '../state/strategy-state.schema';

describe('AppStateSchema', () => {
	it('parse({}) returns expected defaults', () => {
		const result = AppStateSchema.parse({});
		expect(result).toEqual({
			currentLocale: 'en',
			backtestPrefillSymbol: '',
			simulatedMetrics: {
				totalReturn: '42.8',
				maxDrawdown: '-18.2',
				winRate: '58.3'
			}
		});
	});

	it('rejects invalid locale', () => {
		const result = AppStateSchema.safeParse({ currentLocale: 'fr' });
		expect(result.success).toBe(false);
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
