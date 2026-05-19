<script lang="ts">
	import type { RiskFlagItemProps } from '$lib/types';
	import { cn } from '$lib/utils';

	let { flag }: RiskFlagItemProps = $props();
</script>

<div class="group flex items-start gap-3">
	<div
		class={cn(
			'mt-1.5 h-2 w-2 flex-shrink-0 rounded-full',
			flag.severity === 'high' && 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
			flag.severity === 'medium' && 'bg-yellow-500',
			flag.severity === 'low' && 'bg-green-500'
		)}
	></div>
	<div class="space-y-1">
		<div class="flex items-center gap-2 text-xs leading-none font-bold">
			{flag.label}
			<span class="rounded bg-muted px-1 text-[9px] font-normal text-muted-foreground uppercase">
				{flag.severity}
			</span>
		</div>
		<p
			class="line-clamp-2 text-[11px] leading-tight text-muted-foreground transition-all group-hover:line-clamp-none"
		>
			{flag.description}
		</p>
	</div>
</div>
