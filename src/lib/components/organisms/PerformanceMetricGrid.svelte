<script lang="ts">
	import MetricTile from '../molecules/MetricTile.svelte';
	import { defaultMetricTiles } from '$lib/data/performance';
	import type { MetricTile as IMetricTile } from '$lib/types';
	import { PerformanceMetricGridSchema } from '$lib/schemas';

	let state = $state(PerformanceMetricGridSchema.parse({}));
	state.tiles = [...defaultMetricTiles];

	function handleDragStart(index: number) {
		state.draggedIndex = index;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(targetOrder: number) {
		if (state.draggedIndex === null) return;
		const fromIndex = state.tiles.findIndex((t) => t.order === state.draggedIndex);
		const toIndex = state.tiles.findIndex((t) => t.order === targetOrder);

		if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
			const newTiles = [...state.tiles];
			const [moved] = newTiles.splice(fromIndex, 1);
			newTiles.splice(toIndex, 0, moved);
			state.tiles = newTiles.map((t, i) => ({ ...t, order: i }));
		}
		state.draggedIndex = null;
	}

	function handleDoubleClick(tile: IMetricTile) {
		state.editingTileId = tile.id;
		state.editValue = tile.value;
		state.modalOpen = true;
	}
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#each state.tiles as tile (tile.id)}
		<MetricTile
			{tile}
			draggable={true}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			onDoubleClick={handleDoubleClick}
		/>
	{/each}
</div>
