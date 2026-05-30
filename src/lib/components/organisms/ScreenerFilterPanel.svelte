<script module lang="ts">
	import type { Snapshot } from '@sveltejs/kit';
	import { FundamentalScreenerSchema } from '$lib/schemas/fundamental-screener.schema';
	import type { FundamentalScreenerState } from '$lib/schemas/fundamental-screener.schema';

	// Module-level reactive state — accessible from the instance script below.
	// Using module scope allows snapshot.capture/restore to close over `state`
	// without crossing the module/instance boundary.
	let state = $state<FundamentalScreenerState>(FundamentalScreenerSchema.parse({}));

	export const snapshot: Snapshot<FundamentalScreenerState> = {
		capture: () => ({ ...state }),
		restore: (value: unknown) => {
			const result = FundamentalScreenerSchema.safeParse(value);
			if (result.success) {
				state = result.data;
			}
		}
	};
</script>

<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
</script>

<div class="grid items-end gap-4 rounded-xl border bg-card p-6 shadow-sm md:grid-cols-4">
	<div class="space-y-2">
		<Label>Universe</Label>
		<Select.Root type="single" bind:value={state.universe}>
			<Select.Trigger>{state.universe}</Select.Trigger>
			<Select.Content>
				<Select.Item value="S&P 500">S&P 500</Select.Item>
				<Select.Item value="Nasdaq 100">Nasdaq 100</Select.Item>
				<Select.Item value="Russell 2000">Russell 2000</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
	<div class="space-y-2">
		<Label>PE Ratio ≤</Label>
		<Input bind:value={state.peMax} />
	</div>
	<div class="space-y-2">
		<Label>ROIC (%) ≥</Label>
		<Input bind:value={state.roicMin} />
	</div>
	<div class="space-y-2">
		<Label>Rev Growth (%) ≥</Label>
		<Input bind:value={state.revGrowthMin} />
	</div>
</div>
