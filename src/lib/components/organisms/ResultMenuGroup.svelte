<script lang="ts">
  import * as m from '$lib/paraglide/messages';
	import { appState } from '$lib/state/app.svelte';
	import type { NavSection } from '$lib/types';
	import NavItem from '../molecules/NavItem.svelte';
	const resultSections: NavSection[] = [
		{
			id: 'performance-result',
			labelKey: 'performance_result',
			icon: 'bar-chart-3',
			group: 'result'
		},
		{ id: 'market-regime', labelKey: 'market_regime', icon: 'activity', group: 'result' },
		{
			id: 'sentiment-events',
			labelKey: 'sentiment_events',
			icon: 'message-square',
			group: 'result'
		},
		{ id: 'trade-log', labelKey: 'trade_log', icon: 'list', group: 'result' },
		{ id: 'settings-billing', labelKey: 'settings_billing', icon: 'settings', group: 'result' }
	];
</script>

<div class="space-y-1">
  <h3 class="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
    {m.nav_group_result()}
  </h3>
  {#each resultSections as section (section.id)}
    <NavItem
      {section}
      isActive={appState.activeSection === section.id}
      onClick={() => (appState.activeSection = section.id)}
    />
  {/each}
</div>