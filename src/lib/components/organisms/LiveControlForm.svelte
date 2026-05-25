<script lang="ts">
	import { z } from 'zod';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { LiveControlFormSchema } from '$lib/schemas/live-control-form.schema';
	import { toast } from 'svelte-sonner';

	let state = $state<z.infer<typeof LiveControlFormSchema>>(LiveControlFormSchema.parse({}));

	function handleSimulate() {
		toast.success('Simulated re-run applied');
	}
</script>

<div class="mt-auto space-y-4 border-t pt-6">
	<div class="space-y-2">
		<Label class="text-[10px] text-muted-foreground uppercase">Total Return (%)</Label>
		<Input bind:value={state.totalReturn} class="h-8 text-xs" />
	</div>
	<div class="space-y-2">
		<Label class="text-[10px] text-muted-foreground uppercase">Max Drawdown (%)</Label>
		<Input bind:value={state.maxDrawdown} class="h-8 text-xs" />
	</div>
	<div class="space-y-2">
		<Label class="text-[10px] text-muted-foreground uppercase">Win Rate (%)</Label>
		<Input bind:value={state.winRate} class="h-8 text-xs" />
	</div>
	<Button variant="outline" size="sm" class="w-full text-xs" onclick={handleSimulate}>
		Simulate Re-run
	</Button>
</div>
