import { AppStateSchema } from '$lib/schemas/state';

const _defaults = AppStateSchema.parse({});

class AppState {
	currentLocale = $state(_defaults.currentLocale);
	backtestPrefillSymbol = $state(_defaults.backtestPrefillSymbol);
	simulatedMetrics = $state(_defaults.simulatedMetrics);
}

export const appState = new AppState();
