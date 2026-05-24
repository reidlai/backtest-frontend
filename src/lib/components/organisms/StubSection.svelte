<script lang="ts">
	import type { StubSectionProps } from '$lib/schemas';
	let { title = 'Section' }: StubSectionProps = $props();
</script>

<div class="p-6">
	<h1 class="mb-4 text-3xl font-bold tracking-tight">{title}</h1>
	<div
		class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-12"
	>
		<p class="font-medium text-muted-foreground">Content coming soon...</p>
		<p class="mt-2 text-xs text-muted-foreground/60">Implementation planned for later phases.</p>
	</div>
</div>
