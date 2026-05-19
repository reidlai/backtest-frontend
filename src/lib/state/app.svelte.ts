import type { Locale, SectionId } from '../types';

class AppState {
	activeSection = $state<SectionId>('dashboard');
	currentLocale = $state<Locale>('en');
	strategyInputText = $state<string>('');
	backtestPrefillSymbol = $state<string>('');
	simulatedMetrics = $state({
		totalReturn: '42.8',
		maxDrawdown: '-18.2',
		winRate: '58.3'
	});
}

export const appState = new AppState();
