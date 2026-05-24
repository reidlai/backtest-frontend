import { sampleStrategy } from '$lib/data/strategy';
import type { Strategy } from '$lib/types';

const strategyState = {
	inputText: $state<string>(''),
	parsedStrategy: $state<Strategy | null>(null),

	reset() {
		this.inputText = '';
		this.parsedStrategy = null;
	},

	getStrategyConfig(): Strategy {
		return this.parsedStrategy ?? sampleStrategy;
	}
};

export { strategyState };
