import { UniverseCapitalConfigSchema } from '$lib/schemas/universe-capital-config.schema';
import type { BacktestMode } from '$lib/schemas/universe-capital-config.schema';

const _defaults = UniverseCapitalConfigSchema.parse({});

class UniverseCapitalConfigState {
	mode = $state<BacktestMode>(_defaults.mode);
	universe = $state<string>(_defaults.universe);
	initialCapital = $state<string>(_defaults.initialCapital);

	reset() {
		const d = UniverseCapitalConfigSchema.parse({});
		this.mode = d.mode;
		this.universe = d.universe;
		this.initialCapital = d.initialCapital;
	}
}

export const universeCapitalConfigState = new UniverseCapitalConfigState();
