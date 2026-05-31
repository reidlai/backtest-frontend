<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import * as m from '$lib/paraglide/messages';
	import { TREND_OPTIONS, MOMENTUM_OPTIONS } from '$lib/schemas';

	interface Props {
		trendIndicator?: string;
		momentumIndicator?: string;
		trendOptions?: string[];
		momentumOptions?: string[];
	}

	let {
		trendIndicator = $bindable('EMA(200)'),
		momentumIndicator = $bindable('RSI(14)'),
		trendOptions = [...TREND_OPTIONS],
		momentumOptions = [...MOMENTUM_OPTIONS]
	}: Props = $props();
</script>

<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm" aria-label={m.screener_indicator_selection()}>
	<h2 class="text-lg font-semibold">{m.screener_indicator_selection()}</h2>
	<div class="space-y-4">
		<div class="space-y-2">
			<label class="text-sm font-medium" for="trend-select">{m.screener_trend()}</label>
			<Select.Root type="single" bind:value={trendIndicator}>
				<Select.Trigger id="trend-select">{trendIndicator}</Select.Trigger>
				<Select.Content>
					{#each trendOptions as option (option)}
						<Select.Item value={option}>{option}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="space-y-2">
			<label class="text-sm font-medium" for="momentum-select">{m.screener_momentum()}</label>
			<Select.Root type="single" bind:value={momentumIndicator}>
				<Select.Trigger id="momentum-select">{momentumIndicator}</Select.Trigger>
				<Select.Content>
					{#each momentumOptions as option (option)}
						<Select.Item value={option}>{option}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>
</div>
