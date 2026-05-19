<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { MetricTileProps, MetricTile } from '$lib/types';
	import { cn } from '$lib/utils';

	let {
		tile,
		draggable = false,
		onDragStart,
		onDragOver,
		onDrop,
		onDoubleClick
	}: MetricTileProps = $props();

	const isMetricTile = (t: typeof tile): t is MetricTile => 'order' in t;

	function handleDragStart() {
		if (draggable && onDragStart && isMetricTile(tile)) {
			onDragStart(tile.order);
		}
	}

	function handleDragOver(e: DragEvent) {
		if (draggable && onDragOver) {
			onDragOver(e);
		}
	}

	function handleDrop() {
		if (draggable && onDrop && isMetricTile(tile)) {
			onDrop(tile.order);
		}
	}

	function handleDoubleClick() {
		if (onDoubleClick && isMetricTile(tile)) {
			onDoubleClick(tile);
		}
	}
</script>

<Card.Root
	class={cn(
		'relative flex flex-col justify-between p-4 transition-colors',
		draggable && 'cursor-move hover:bg-muted/50'
	)}
	{draggable}
	ondragstart={handleDragStart}
	ondragover={handleDragOver}
	ondrop={handleDrop}
	ondblclick={handleDoubleClick}
>
	<div class="flex items-start justify-between">
		<span class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
			{tile.label}
		</span>
	</div>

	<div class="mt-2 flex items-baseline gap-1">
		<span class="text-2xl font-bold">{tile.value}</span>
		{#if isMetricTile(tile)}
			<span class="text-sm font-medium text-muted-foreground">{tile.unit}</span>
		{/if}
	</div>

	{#if 'delta' in tile && tile.delta}
		{@const t = tile as { delta: string; deltaPositive: boolean }}
		<div
			class={cn('mt-1 text-xs font-semibold', t.deltaPositive ? 'text-green-400' : 'text-red-400')}
		>
			{t.delta}
		</div>
	{/if}
</Card.Root>
