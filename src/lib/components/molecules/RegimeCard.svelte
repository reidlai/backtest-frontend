<script lang="ts">
	import { z } from 'zod';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { MarketRegimeSchema } from '$lib/schemas';
	import { cn } from '$lib/utils';

	type Props = { regime: z.infer<typeof MarketRegimeSchema> };
	let { regime }: Props = $props();
</script>

<Card.Root
	class={cn(
		'overflow-hidden border-l-4',
		regime.status === 'active' && 'border-l-green-500',
		regime.status === 'warning' && 'border-l-yellow-500',
		regime.status === 'inactive' && 'border-l-gray-500'
	)}
>
	<Card.Header class="pb-2">
		<div class="mb-2 flex items-center justify-between">
			<Badge
				variant="secondary"
				class={cn(
					'text-[10px] font-bold uppercase',
					regime.status === 'active' && 'bg-green-500/10 text-green-500',
					regime.status === 'warning' && 'bg-yellow-500/10 text-yellow-500',
					regime.status === 'inactive' && 'bg-gray-500/10 text-gray-400'
				)}
			>
				{regime.status}
			</Badge>
			<div
				class={cn(
					'h-2 w-2 rounded-full',
					regime.status === 'active' && 'animate-pulse bg-green-500',
					regime.status === 'warning' && 'bg-yellow-500',
					regime.status === 'inactive' && 'bg-gray-500'
				)}
			></div>
		</div>
		<Card.Title class="text-lg">{regime.name}</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-4">
		<p class="text-xs leading-relaxed text-muted-foreground">
			{regime.logicDescription}
		</p>
		<div class="flex flex-wrap gap-1">
			{#each regime.indicators as indicator (indicator)}
				<Badge variant="outline" class="h-4 px-1.5 py-0 font-mono text-[9px]">{indicator}</Badge>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
