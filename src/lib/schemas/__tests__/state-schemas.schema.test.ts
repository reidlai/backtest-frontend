import { describe, it, expect } from 'vitest';
import { AppStateSchema, SimulatedMetricsSchema } from '../app-state.schema';
import {
	UniverseCapitalConfigSchema,
	ScheduleExecutionConfigSchema,
	OrderTypesConfigSchema
} from '../../schemas/index';
import { StrategyStateSchema } from '../strategy-state.schema';
import { LiveControlFormSchema } from '../live-control-form.schema';

describe('AppStateSchema', () => {
	it('parse({}) returns expected defaults', () => {
		const result = AppStateSchema.parse({});
		expect(result).toEqual({
			backtestPrefillSymbol: '',
			simulatedMetrics: { totalReturn: 0, maxDrawdown: 0, winRate: 0 }
		});
	});
});

describe('SimulatedMetricsSchema', () => {
	it('parse({}) returns expected defaults', () => {
		const result = SimulatedMetricsSchema.parse({});
		expect(result).toEqual({ totalReturn: 0, maxDrawdown: 0, winRate: 0 });
	});

	it('rejects non-numeric totalReturn', () => {
		const result = SimulatedMetricsSchema.safeParse({ totalReturn: 'bad' });
		expect(result.success).toBe(false);
	});

	it('rejects non-numeric maxDrawdown', () => {
		const result = SimulatedMetricsSchema.safeParse({ maxDrawdown: 'bad' });
		expect(result.success).toBe(false);
	});

	it('rejects non-numeric winRate', () => {
		const result = SimulatedMetricsSchema.safeParse({ winRate: 'bad' });
		expect(result.success).toBe(false);
	});
});

describe('UniverseCapitalConfigSchema', () => {
	it('parse({}) returns expected defaults', () => {
		const result = UniverseCapitalConfigSchema.parse({});
		expect(result.mode).toBe('Single Stock');
		expect(result.universe).toBe('SPY');
		expect(result.initialCapital).toBe('100000');
	});

	it('rejects invalid mode', () => {
		const result = UniverseCapitalConfigSchema.safeParse({ mode: 'InvalidMode' });
		expect(result.success).toBe(false);
	});
});

describe('ScheduleExecutionConfigSchema', () => {
	it('parse({}) returns expected defaults', () => {
		const result = ScheduleExecutionConfigSchema.parse({});
		expect(result.startDate).toBe('2020-01-01');
		expect(result.endDate).toBe('2024-12-31');
		expect(result.timeframe).toBe('Daily');
		expect(result.direction).toBe('Long');
	});

	it('rejects invalid direction', () => {
		const result = ScheduleExecutionConfigSchema.safeParse({ direction: 'Up' });
		expect(result.success).toBe(false);
	});
});

describe('OrderTypesConfigSchema', () => {
	it('parse({}) returns expected defaults', () => {
		const result = OrderTypesConfigSchema.parse({});
		expect(result.selectedOrderTypes).toEqual(['Market']);
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
