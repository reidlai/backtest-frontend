import { z } from 'zod';
import { sampleStrategy } from '$lib/shared-mockdata/strategy';
import { StrategyStateSchema, StrategySchema } from '$lib/schemas';

type Strategy = z.infer<typeof StrategySchema>;

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
