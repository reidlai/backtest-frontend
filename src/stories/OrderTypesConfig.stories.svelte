<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrderTypesConfig from '$lib/components/organisms/OrderTypesConfig.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/OrderTypesConfig',
		component: OrderTypesConfig,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<Story name="Default" />

<Story name="WithRunHandler" args={{ onRun: () => console.log('Run Backtest clicked') }} />
