import { AppStateSchema } from '$lib/schemas';

const _defaults = AppStateSchema.parse({});

class AppState {
	backtestPrefillSymbol = $state(_defaults.backtestPrefillSymbol);
	simulatedMetrics = $state(_defaults.simulatedMetrics);
}

export const appState = new AppState();
