import { z } from 'zod';
import { sampleStrategy } from '$lib/shared-mockdata/strategy';
import { StrategyStateSchema, StrategySchema, BacktestResultSchema } from '$lib/schemas';

type Strategy = z.infer<typeof StrategySchema>;
type BacktestResult = z.infer<typeof BacktestResultSchema>;

const _defaults = StrategyStateSchema.parse({});

class StrategyState {
	inputText = $state<string>(_defaults.inputText);
	parsedStrategy = $state<Strategy | null>(_defaults.parsedStrategy);
	isRunning = $state<boolean>(false);
	backtestResult = $state<BacktestResult | null>(null);
	runError = $state<string | null>(null);

	reset() {
		const d = StrategyStateSchema.parse({});
		this.inputText = d.inputText;
		this.parsedStrategy = d.parsedStrategy;
		this.isRunning = false;
		this.backtestResult = null;
		this.runError = null;
	}

	getStrategyConfig(): Strategy {
		return this.parsedStrategy ?? sampleStrategy;
	}
}

export const strategyState = new StrategyState();
