<script module lang="ts">
	import { z } from 'zod';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ScreenerResultRow from '$lib/components/molecules/ScreenerResultRow.svelte';
	import { ScreenerResultSchema } from '$lib/schemas';

	type ScreenerResult = z.infer<typeof ScreenerResultSchema>;

	const { Story } = defineMeta({
		title: 'Molecules/ScreenerResultRow',
		component: ScreenerResultRow,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});

	const appleResult: ScreenerResult = {
		symbol: 'AAPL',
		name: 'Apple Inc.',
		peRatio: 28.4,
		evEbitda: 21.3,
		fcfYield: 4.2,
		roic: 31.5,
		revenueGrowth: 8.1,
		epsGrowth: 12.3,
		score: 82
	};

	const nvdaResult: ScreenerResult = {
		symbol: 'NVDA',
		name: 'NVIDIA Corporation',
		peRatio: 45.2,
		evEbitda: 35.7,
		fcfYield: 1.8,
		roic: 52.1,
		revenueGrowth: 84.0,
		epsGrowth: 122.0,
		score: 94
	};
</script>

<Story name="Standard Row" args={{ result: appleResult, onBacktest: () => {} }} />

<Story name="High Score Row" args={{ result: nvdaResult, onBacktest: () => {} }} />
