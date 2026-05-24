<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { page } from '$app/state';
	import NavItem from '../molecules/NavItem.svelte';
	import { MainMenuGroupSchema } from '$lib/schemas';

	let state = $state(MainMenuGroupSchema.parse({}));
	state.mainSections = [
		{
			id: 'dashboard',
			path: '/research-workbench',
			labelKey: 'dashboard',
			icon: 'layout-dashboard',
			group: 'main'
		},
		{
			id: 'strategy-builder',
			path: '/strategy-builder',
			labelKey: 'ai_strategy_builder',
			icon: 'zap',
			group: 'main'
		},
		{
			id: 'fundamental-screener',
			path: '/fundamental-screener',
			labelKey: 'fundamental_screener',
			icon: 'search',
			group: 'main'
		},
		{
			id: 'technical-screener',
			path: '/technical-screener',
			labelKey: 'technical_screener',
			icon: 'trending-up',
			group: 'main'
		},
		{
			id: 'market-regime',
			path: '/market-regime',
			labelKey: 'market_regime',
			icon: 'activity',
			group: 'main'
		},
		{
			id: 'sentiment-events',
			path: '/sentiment-events',
			labelKey: 'sentiment_events',
			icon: 'message-square',
			group: 'main'
		}
	];
</script>

<!-- Main Group -->
<div class="space-y-1">
	<h3 class="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
		{m.nav_group_main()}
	</h3>
	{#each state.mainSections as section (section.id)}
		<NavItem {section} isActive={page.url.pathname === section.path} href={section.path} />
	{/each}
</div>
