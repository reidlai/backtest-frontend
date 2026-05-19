<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RiskFlagItem from '$lib/components/molecules/RiskFlagItem.svelte';
	import type { RiskFlag } from '$lib/types';

	const { Story } = defineMeta({
		title: 'Molecules/RiskFlagItem',
		component: RiskFlagItem,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		}
	});

	const highFlag: RiskFlag = {
		id: 'overfit-high',
		label: 'Overfitting Risk',
		severity: 'high',
		description:
			'Strategy parameters too tightly fit to historical data — likely to underperform out-of-sample.'
	};

	const mediumFlag: RiskFlag = {
		id: 'regime-dep',
		label: 'Regime Dependency',
		severity: 'medium',
		description: 'Strategy performs well in bull markets but may degrade during regime shifts.'
	};

	const lowFlag: RiskFlag = {
		id: 'survivor-bias',
		label: 'Survivorship Bias',
		severity: 'low',
		description: 'Universe may include only currently listed companies, excluding delisted stocks.'
	};
</script>

<Story name="High Severity" args={{ flag: highFlag }} />

<Story name="Medium Severity" args={{ flag: mediumFlag }} />

<Story name="Low Severity" args={{ flag: lowFlag }} />
