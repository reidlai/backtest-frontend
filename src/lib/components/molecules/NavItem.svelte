<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import type { NavItemProps } from '$lib/types';
	import { cn } from '$lib/utils';

	let { section, isActive, href }: NavItemProps = $props();
</script>

<a
	{href}
	class={cn(
		'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-all',
		isActive
			? 'bg-primary/10 font-semibold text-primary'
			: 'font-normal text-muted-foreground hover:bg-accent hover:text-foreground'
	)}
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
</a>
