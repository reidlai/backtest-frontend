<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { orderTypesConfigState } from '$lib/state/order-types-config.svelte';
	import type { OrderType } from '$lib/schemas/order-types-config.schema';

	const orderTypes: OrderType[] = [
		'Market',
		'Limit',
		'Stop',
		'Stop-Limit',
		'Trailing Stop',
		'Bracket',
		'OCO',
		'Short Sell'
	];

	let { onRun = () => {} }: { onRun?: () => void } = $props();
</script>

<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
	<h2 class="text-lg font-semibold">Order Types</h2>
	<div class="grid grid-cols-2 gap-y-3">
		{#each orderTypes as type (type)}
			<div class="flex items-center space-x-2">
				<input
					type="checkbox"
					id={type}
					checked={orderTypesConfigState.selectedOrderTypes.has(type)}
					onchange={(e) => {
						if ((e.target as HTMLInputElement).checked)
							orderTypesConfigState.selectedOrderTypes.add(type);
						else orderTypesConfigState.selectedOrderTypes.delete(type);
					}}
					class="h-4 w-4 cursor-pointer rounded border border-input accent-primary"
				/>
				<Label for={type} class="cursor-pointer text-sm font-normal">{type}</Label>
			</div>
		{/each}
	</div>
	<div class="pt-4">
		<Button class="w-full" onclick={onRun}>Run Backtest</Button>
	</div>
</div>
