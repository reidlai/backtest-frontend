<script lang="ts">
	import { z } from 'zod';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { ScreenerResultSchema } from '$lib/schemas';

	type Props = {
		result: z.infer<typeof ScreenerResultSchema>;
		onBacktest: (symbol: string) => void;
	};
	let { result, onBacktest }: Props = $props();
</script>

<Table.Row>
	<Table.Cell class="font-medium">{result.symbol}</Table.Cell>
	<Table.Cell>{result.name}</Table.Cell>
	<Table.Cell>{result.peRatio}</Table.Cell>
	<Table.Cell>{result.evEbitda}</Table.Cell>
	<Table.Cell>{result.fcfYield}%</Table.Cell>
	<Table.Cell>{result.roic}%</Table.Cell>
	<Table.Cell class={result.revenueGrowth > 0 ? 'text-green-400' : 'text-red-400'}>
		{result.revenueGrowth}%
	</Table.Cell>
	<Table.Cell class={result.epsGrowth > 0 ? 'text-green-400' : 'text-red-400'}>
		{result.epsGrowth}%
	</Table.Cell>
	<Table.Cell>
		<div class="flex items-center gap-2">
			<div class="h-2 w-full max-w-[60px] overflow-hidden rounded-full bg-muted">
				<div class="h-full bg-primary" style:width="{result.score}%"></div>
			</div>
			<span class="text-xs font-bold">{result.score}</span>
		</div>
	</Table.Cell>
	<Table.Cell>
		<Button size="sm" variant="outline" onclick={() => onBacktest(result.symbol)}>Backtest</Button>
	</Table.Cell>
</Table.Row>
