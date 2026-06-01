<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import { SentimentEventSchema } from '$lib/schemas';
	import type { z } from 'zod';

	type SentimentEvent = z.infer<typeof SentimentEventSchema>;

	let { events }: { events: unknown[] } = $props();

	const validatedEvents = $derived(
		events.flatMap((e) => {
			const result = SentimentEventSchema.safeParse(e);
			if (!result.success) {
				console.warn('[SentimentEventsTable] Invalid event excluded:', result.error.issues, e);
				return [];
			}
			return [result.data as SentimentEvent];
		})
	);
</script>

<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Type</Table.Head>
				<Table.Head>Symbol</Table.Head>
				<Table.Head>Date</Table.Head>
				<Table.Head class="w-[400px]">Headline</Table.Head>
				<Table.Head>Sentiment</Table.Head>
				<Table.Head>Score</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if validatedEvents.length === 0}
				<Table.Row>
					<Table.Cell colspan={6} class="text-center text-sm text-muted-foreground">
						No events found
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each validatedEvents as event (event.id)}
					<Table.Row>
						<Table.Cell>
							<Badge variant="outline" class="text-[10px] font-bold uppercase">{event.type}</Badge>
						</Table.Cell>
						<Table.Cell class="font-bold">{event.symbol || 'Global'}</Table.Cell>
						<Table.Cell class="text-xs text-muted-foreground">{event.date}</Table.Cell>
						<Table.Cell class="text-sm font-medium">{event.headline}</Table.Cell>
						<Table.Cell>
							<Badge
								class={cn(
									'text-[10px] uppercase',
									event.sentiment === 'positive' &&
										'border-green-500/20 bg-green-500/10 text-green-500',
									event.sentiment === 'negative' && 'border-red-500/20 bg-red-500/10 text-red-500',
									event.sentiment === 'neutral' && 'bg-muted text-muted-foreground'
								)}
								variant="outline"
							>
								{event.sentiment}
							</Badge>
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<div class="relative h-1.5 w-16 overflow-hidden rounded-full bg-muted">
									<div
										class={cn(
											'absolute h-full',
											event.score > 0 ? 'left-1/2 bg-green-500' : 'right-1/2 bg-red-500'
										)}
										style:width="{Math.abs(event.score) * 50}%"
									></div>
								</div>
								<span class="font-mono text-[10px]">{event.score.toFixed(2)}</span>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
