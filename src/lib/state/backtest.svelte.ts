import { SvelteSet } from 'svelte/reactivity';
import type { BacktestMode, OrderType } from '$lib/types';

const defaultOrderTypes: OrderType[] = ['Market'];

class BacktestState {
	mode = $state<BacktestMode>('Single Stock');
	initialCapital = $state<string>('100000');
	startDate = $state<string>('2020-01-01');
	endDate = $state<string>('2024-12-31');
	universe = $state<string>('SPY');
	timeframe = $state<string>('Daily');
	direction = $state<'Long' | 'Short' | 'Both'>('Long');
	selectedOrderTypes = new SvelteSet<OrderType>(defaultOrderTypes);

	reset() {
		this.mode = 'Single Stock';
		this.initialCapital = '100000';
		this.startDate = '2020-01-01';
		this.endDate = '2024-12-31';
		this.universe = 'SPY';
		this.timeframe = 'Daily';
		this.direction = 'Long';
		this.selectedOrderTypes.clear();
		this.selectedOrderTypes.add('Market');
	}
}

export const backtestState = new BacktestState();
