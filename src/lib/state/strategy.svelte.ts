import { sampleStrategy } from '$lib/data/strategy';
import type { Strategy } from '$lib/types';

class StrategyState {
	inputText = $state<string>('');
	parsedStrategy = $state<Strategy | null>(null);

	reset() {
		this.inputText = '';
		this.parsedStrategy = null;
	}

	getStrategyConfig(): Strategy {
		return this.parsedStrategy ?? sampleStrategy;
	}
}

export const strategyState = new StrategyState();
