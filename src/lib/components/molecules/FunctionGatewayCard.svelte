<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages';
	import type { FunctionGatewayCardProps } from '$lib/types';

	let { card, onClick }: FunctionGatewayCardProps = $props();
</script>

<Card.Root class="group cursor-pointer transition-all hover:border-primary/50" onclick={onClick}>
	<Card.Header>
		<div
			class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20"
		>
			<!-- Icon placeholder - in real app would use Lucide -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m21 16-4 4-4-4" /><path d="M17 20V4" /></svg
			>
		</div>
		<Card.Title class="text-lg">
			{(m as unknown as Record<string, () => string>)[card.titleKey]()}
		</Card.Title>
		<Card.Description>
			{(m as unknown as Record<string, () => string>)[card.descriptionKey]()}
		</Card.Description>
	</Card.Header>
</Card.Root>
