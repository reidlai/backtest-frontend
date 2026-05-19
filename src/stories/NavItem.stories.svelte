<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import NavItem from '$lib/components/molecules/NavItem.svelte';
	import type { NavSection } from '$lib/types';

	const { Story } = defineMeta({
		title: 'Molecules/NavItem',
		component: NavItem,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});

	const dashboardSection: NavSection = {
		id: 'dashboard',
		labelKey: 'dashboard',
		icon: 'layout-dashboard',
		group: 'main'
	};

	const backtestSection: NavSection = {
		id: 'backtest-engine',
		labelKey: 'backtest_engine',
		icon: 'play',
		group: 'main'
	};
</script>

<Story name="Active" args={{ section: dashboardSection, isActive: true, onClick: () => {} }} />

<Story name="Inactive" args={{ section: backtestSection, isActive: false, onClick: () => {} }} />
