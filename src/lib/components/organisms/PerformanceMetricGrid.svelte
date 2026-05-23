<script lang="ts">
	import MetricTile from '../molecules/MetricTile.svelte';
	import {
		defaultMetricTiles,
	} from '$lib/data/performance';
  import type { MetricTile as IMetricTile } from '$lib/types';
	
  let tiles = $state([...defaultMetricTiles]);
  let draggedIndex = $state<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let editingTileId = $state<string | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let editValue = $state('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let modalOpen = $state(false);

	// Drag handlers
	function handleDragStart(index: number) {
		draggedIndex = index;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

  function handleDrop(targetOrder: number) {
		if (draggedIndex === null) return;
		const fromIndex = tiles.findIndex((t) => t.order === draggedIndex);
		const toIndex = tiles.findIndex((t) => t.order === targetOrder);

		if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
			const newTiles = [...tiles];
			const [moved] = newTiles.splice(fromIndex, 1);
			newTiles.splice(toIndex, 0, moved);
			// Update orders
			tiles = newTiles.map((t, i) => ({ ...t, order: i }));
		}
		draggedIndex = null;
	}

	function handleDoubleClick(tile: IMetricTile) {
		editingTileId = tile.id;
		editValue = tile.value;
		modalOpen = true;
	}

</script>
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {#each tiles as tile (tile.id)}
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