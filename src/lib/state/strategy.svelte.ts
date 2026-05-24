import { sampleStrategy } from '$lib/data/strategy';
import { StrategyStateSchema } from '$lib/schemas/state';
import type { Strategy } from '$lib/types';

const _defaults = StrategyStateSchema.parse({});

class StrategyState {
	inputText = $state<string>(_defaults.inputText);
	parsedStrategy = $state<Strategy | null>(_defaults.parsedStrategy);

	reset() {
		const d = StrategyStateSchema.parse({});
		this.inputText = d.inputText;
		this.parsedStrategy = d.parsedStrategy;
	}

	getStrategyConfig(): Strategy {
		return this.parsedStrategy ?? sampleStrategy;
	}
}

export const strategyState = new StrategyState();
