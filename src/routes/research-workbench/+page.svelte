<script lang="ts">
	import type { Snapshot } from '@sveltejs/kit';
	import { z } from 'zod';
	import * as m from '$lib/paraglide/messages';
	import DashboardMetricGrid from '$lib/components/organisms/DashboardMetricGrid.svelte';
	import AIResearchBox from '$lib/components/organisms/AIResearchBox.svelte';
	import FunctionGateways from '$lib/components/organisms/FunctionGateways.svelte';

	let aiText = $state('');

	const AIResearchBoxSnapshotSchema = z.object({ aiText: z.string().default('') });

	export const snapshot: Snapshot = {
		capture: () => ({ aiText }),
		restore: (value: unknown) => {
			const result = AIResearchBoxSnapshotSchema.safeParse(value);
			if (result.success) aiText = result.data.aiText;
		}
	};
</script>

<div class="space-y-8 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">{m.dashboard_title()}</h1>
	</div>

	<DashboardMetricGrid />
	<div class="grid gap-8 lg:grid-cols-2">
		<AIResearchBox bind:aiText />
		<FunctionGateways />
	</div>
</div>
