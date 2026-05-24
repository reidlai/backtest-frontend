<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { appState } from '$lib/state/app.svelte';
	import { toast } from 'svelte-sonner';
	function handleSimulate() {
		toast.success('Simulated re-run applied');
	}
</script>

<div class="mt-auto space-y-4 border-t pt-6">
	<div class="space-y-2">
		<Label class="text-[10px] text-muted-foreground uppercase">Total Return (%)</Label>
		<Input bind:value={appState.simulatedMetrics.totalReturn} class="h-8 text-xs" />
	</div>
	<div class="space-y-2">
		<Label class="text-[10px] text-muted-foreground uppercase">Max Drawdown (%)</Label>
		<Input bind:value={appState.simulatedMetrics.maxDrawdown} class="h-8 text-xs" />
	</div>
	<div class="space-y-2">
		<Label class="text-[10px] text-muted-foreground uppercase">Win Rate (%)</Label>
		<Input bind:value={appState.simulatedMetrics.winRate} class="h-8 text-xs" />
	</div>
	<Button variant="outline" size="sm" class="w-full text-xs" onclick={handleSimulate}>
		Simulate Re-run
	</Button>
</div>
