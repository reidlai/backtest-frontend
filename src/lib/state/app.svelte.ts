import type { Locale } from '../types';

class AppState {
	currentLocale = $state<Locale>('en');
	backtestPrefillSymbol = $state<string>('');
	simulatedMetrics = $state({
		totalReturn: '42.8',
		maxDrawdown: '-18.2',
		winRate: '58.3'
	});
}

export const appState = new AppState();
