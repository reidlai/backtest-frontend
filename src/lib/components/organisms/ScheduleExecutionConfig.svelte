<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { scheduleExecutionConfigState } from '$lib/state/schedule-execution-config.svelte';
</script>

<div class="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
	<h2 class="text-lg font-semibold">Schedule & Execution</h2>
	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label for="start-date">Start Date</Label>
			<Input id="start-date" type="date" bind:value={scheduleExecutionConfigState.startDate} />
		</div>
		<div class="space-y-2">
			<Label for="end-date">End Date</Label>
			<Input id="end-date" type="date" bind:value={scheduleExecutionConfigState.endDate} />
		</div>
	</div>
	<div class="space-y-2">
		<Label>Timeframe</Label>
		<Select.Root type="single" bind:value={scheduleExecutionConfigState.timeframe}>
			<Select.Trigger>{scheduleExecutionConfigState.timeframe}</Select.Trigger>
			<Select.Content>
				<Select.Item value="Minute">Minute</Select.Item>
				<Select.Item value="Hourly">Hourly</Select.Item>
				<Select.Item value="Daily">Daily</Select.Item>
				<Select.Item value="Weekly">Weekly</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
	<div class="space-y-2">
		<Label>Direction</Label>
		<Select.Root type="single" bind:value={scheduleExecutionConfigState.direction}>
			<Select.Trigger>{scheduleExecutionConfigState.direction}</Select.Trigger>
			<Select.Content>
				<Select.Item value="Long">Long Only</Select.Item>
				<Select.Item value="Short">Short Only</Select.Item>
				<Select.Item value="Both">Long & Short</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
</div>
