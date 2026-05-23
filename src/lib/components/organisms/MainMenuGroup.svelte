<script lang="ts">
  import * as m from '$lib/paraglide/messages';
	import { appState } from '$lib/state/app.svelte';
	import type { NavSection } from '$lib/types';
	import NavItem from '../molecules/NavItem.svelte';

	const mainSections: NavSection[] = [
		{ id: 'dashboard', labelKey: 'dashboard', icon: 'layout-dashboard', group: 'main' },
		{ id: 'strategy-builder', labelKey: 'ai_strategy_builder', icon: 'zap', group: 'main' },
		{ id: 'fundamental-screener', labelKey: 'fundamental_screener', icon: 'search', group: 'main' },
		{
			id: 'technical-screener',
			labelKey: 'technical_screener',
			icon: 'trending-up',
			group: 'main'
		},
		{ id: 'backtest-engine', labelKey: 'backtest_engine', icon: 'play', group: 'main' }
	];
</script>

<!-- Main Group -->
<div class="space-y-1">
  <h3 class="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
    {m.nav_group_main()}
  </h3>
  {#each mainSections as section (section.id)}
    <NavItem
      {section}
      isActive={appState.activeSection === section.id}
      onClick={() => (appState.activeSection = section.id)}
    />
  {/each}
</div>