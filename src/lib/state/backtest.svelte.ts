import { SvelteSet } from 'svelte/reactivity';
import { z } from 'zod';
import { BacktestStateSchema, BacktestModeSchema, OrderTypeSchema } from '$lib/schemas';

type BacktestMode = z.infer<typeof BacktestModeSchema>;
type OrderType = z.infer<typeof OrderTypeSchema>;

const _defaults = BacktestStateSchema.parse({});

class BacktestState {
	mode = $state<BacktestMode>(_defaults.mode);
	initialCapital = $state<string>(_defaults.initialCapital);
	startDate = $state<string>(_defaults.startDate);
	endDate = $state<string>(_defaults.endDate);
	universe = $state<string>(_defaults.universe);
	timeframe = $state<string>(_defaults.timeframe);
	direction = $state<'Long' | 'Short' | 'Both'>(_defaults.direction);
	selectedOrderTypes = new SvelteSet<OrderType>(_defaults.selectedOrderTypes as OrderType[]);

	reset() {
		const d = BacktestStateSchema.parse({});
		this.mode = d.mode;
		this.initialCapital = d.initialCapital;
		this.startDate = d.startDate;
		this.endDate = d.endDate;
		this.universe = d.universe;
		this.timeframe = d.timeframe;
		this.direction = d.direction;
		this.selectedOrderTypes.clear();
		for (const t of d.selectedOrderTypes) {
			this.selectedOrderTypes.add(t as OrderType);
		}
	}
}

export const backtestState = new BacktestState();
