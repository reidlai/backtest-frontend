<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import type { NavItemProps } from '$lib/types';
	import { cn } from '$lib/utils';

	let { section, isActive, onClick }: NavItemProps = $props();
</script>

<Button
	variant={isActive ? 'secondary' : 'ghost'}
	class={cn(
		'w-full justify-start gap-3 px-3 py-2 text-sm transition-all',
		isActive
			? 'bg-primary/10 font-semibold text-primary'
			: 'font-normal text-muted-foreground hover:text-foreground'
	)}
	onclick={onClick}
>
	<!-- Icon placeholder - in real app would use Lucide based on section.icon -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="flex-shrink-0"
		><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg
	>
	<span>{(m as unknown as Record<string, () => string>)[section.labelKey]()}</span>
</Button>
