<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { page } from '$app/state';
	import type { NavSection } from '$lib/types';
	import NavItem from '../molecules/NavItem.svelte';

	const resultSections: NavSection[] = [
		{
			id: 'backtest-engine',
			path: '/backtest-engine',
			labelKey: 'backtest_engine',
			icon: 'play',
			group: 'result'
		},
		{
			id: 'performance-result',
			path: '/performance-result',
			labelKey: 'performance_result',
			icon: 'bar-chart-3',
			group: 'result'
		},
		{ id: 'trade-log', path: '/trade-lot', labelKey: 'trade_log', icon: 'list', group: 'result' },
		{
			id: 'settings-billing',
			path: '/setting-billing',
			labelKey: 'settings_billing',
			icon: 'settings',
			group: 'result'
		}
	];
</script>

<div class="space-y-1">
	<h3 class="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
		{m.nav_group_result()}
	</h3>
	{#each resultSections as section (section.id)}
		<NavItem {section} isActive={page.url.pathname === section.path} href={section.path} />
	{/each}
</div>
