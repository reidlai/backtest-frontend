<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { EditMetricModalStateSchema, EditMetricValueSchema } from '$lib/schemas/edit-metric-modal.schema';

	interface Props {
		open: boolean;
		tileId: string | null;
		initialValue: string;
		onApply: (newValue: string) => void;
		onClose: () => void;
	}

	let { open, tileId, initialValue, onApply, onClose }: Props = $props();

	const state = $state(EditMetricModalStateSchema.parse({}));

	const isValid = $derived(
		tileId !== null && EditMetricValueSchema.safeParse(state.editValue).success
	);

	// Reset editValue to initialValue each time open transitions false → true
	let prevOpen = false;
	$effect(() => {
		if (open && !prevOpen) {
			state.editValue = initialValue;
		}
		prevOpen = open;
	});

	function handleApply() {
		if (!isValid) return;
		onApply(state.editValue);
		onClose();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Metric Value</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="edit-metric-value">New Value</Label>
				<Input
					id="edit-metric-value"
					bind:value={state.editValue}
					class={!isValid && state.editValue !== '' ? 'border-destructive' : ''}
				/>
				{#if !isValid && state.editValue !== ''}
					<p class="text-xs text-destructive">Must be a valid number.</p>
				{/if}
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={onClose}>Cancel</Button>
			<Button disabled={!isValid} onclick={handleApply}>Apply</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
