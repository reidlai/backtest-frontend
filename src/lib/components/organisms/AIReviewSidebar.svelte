<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import { toast } from 'svelte-sonner';
	import { getContext } from 'svelte';
	import { appState } from '$lib/state/app.svelte';
	import { sampleTrades, tradesToCsv } from '$lib/data/trades';
	import { sampleAIReview, sampleResourceUsage } from '$lib/data/strategy';
	import RiskFlagItem from '../molecules/RiskFlagItem.svelte';
	import type { ChatMessage } from '$lib/types';

	interface OrganismRefs {
		strategyBuilder?: { reset?: () => void };
		backtest?: { reset?: () => void };
	}

	const organismRefs = getContext<OrganismRefs>('organism-refs');

	let chatInput = $state('');
	let messages = $state<ChatMessage[]>([]);

	function handleSendMessage() {
		if (!chatInput.trim()) return;

		const userMsg: ChatMessage = {
			id: Math.random().toString(36).substring(7),
			role: 'user',
			content: chatInput,
			timestamp: new Date().toLocaleTimeString()
		};

		const assistantMsg: ChatMessage = {
			id: Math.random().toString(36).substring(7),
			role: 'assistant',
			content:
				"I've analyzed your request. Based on current market regimes, the strategy seems viable but carries moderate overfitting risk.",
			timestamp: new Date().toLocaleTimeString()
		};

		messages = [...messages, userMsg, assistantMsg];
		chatInput = '';
	}

	function handleNewStrategy() {
		organismRefs?.strategyBuilder?.reset?.();
		appState.activeSection = 'strategy-builder';
		toast.success('Strategy Builder reset');
	}

	function handleNewBacktest() {
		organismRefs?.backtest?.reset?.();
		appState.activeSection = 'backtest-engine';
		toast.success('Backtest parameters reset');
	}

	function handleExportCSV() {
		const csv = tradesToCsv(sampleTrades);
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'trade-log.csv';
		a.click();
		URL.revokeObjectURL(url);
		toast.success('CSV Exported');
	}
</script>

<aside
	class="flex h-full w-[280px] flex-col space-y-4 overflow-hidden border-l bg-card/30 p-4 backdrop-blur-md"
>
	<!-- AI Review Panel -->
	<div class="space-y-4 rounded-xl border bg-card/50 p-4 shadow-sm">
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
				AI Review
			</h3>
			<Badge variant="outline" class="border-primary/20 bg-primary/5 text-[10px] text-primary">
				CONFIDENCE: {sampleAIReview.confidence.toUpperCase()}
			</Badge>
		</div>

		<div class="flex items-center gap-4">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl font-black text-primary ring-4 ring-primary/5"
			>
				{sampleAIReview.grade}
			</div>
			<div class="space-y-1">
				<p class="text-xs font-medium">Strategy Grade</p>
				<p class="line-clamp-1 text-[10px] text-muted-foreground">Last assessment: Just now</p>
			</div>
		</div>

		<div class="space-y-3 pt-2">
			{#each sampleAIReview.riskFlags as flag (flag.id)}
				<RiskFlagItem {flag} />
			{/each}
		</div>
	</div>

	<!-- Resource & Cost Panel -->
	<div class="space-y-4 rounded-xl border bg-card/50 p-4 shadow-sm">
		<h3 class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
			Resource & Cost
		</h3>

		<div class="space-y-3">
			<div class="space-y-1.5">
				<div class="flex justify-between text-[10px] font-medium text-muted-foreground uppercase">
					<span>Tokens Used</span>
					<span>{sampleResourceUsage.tokensUsed} / {sampleResourceUsage.tokensTotal}</span>
				</div>
				<Progress
					value={(sampleResourceUsage.tokensUsed / sampleResourceUsage.tokensTotal) * 100}
					class="h-1"
				/>
			</div>

			<div class="space-y-1.5">
				<div class="flex justify-between text-[10px] font-medium text-muted-foreground uppercase">
					<span>Backtests</span>
					<span>{sampleResourceUsage.backtestsUsed} / {sampleResourceUsage.backtestsTotal}</span>
				</div>
				<Progress
					value={(sampleResourceUsage.backtestsUsed / sampleResourceUsage.backtestsTotal) * 100}
					class="h-1"
				/>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-2 pt-1">
			<div class="rounded border bg-muted/30 p-2">
				<p class="mb-0.5 text-[9px] text-muted-foreground uppercase">Est. Runtime</p>
				<p class="text-xs font-bold">{sampleResourceUsage.estimatedRuntime}</p>
			</div>
			<div class="rounded border bg-muted/30 p-2">
				<p class="mb-0.5 text-[9px] text-muted-foreground uppercase">Plan Impact</p>
				<p class="text-xs font-bold text-yellow-500 capitalize">{sampleResourceUsage.planImpact}</p>
			</div>
		</div>
	</div>

	<!-- AI Chat Panel -->
	<div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card/50 shadow-sm">
		<div class="border-b bg-muted/10 p-3">
			<h3 class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">AI Chat</h3>
		</div>

		<div class="scrollbar-hide flex-1 space-y-3 overflow-y-auto p-3">
			{#if messages.length === 0}
				<p class="mt-8 px-4 text-center text-[11px] text-muted-foreground">
					Ask me about your strategy parameters or optimization tips.
				</p>
			{/if}
			{#each messages as msg (msg.id)}
				<div class={msg.role === 'user' ? 'ml-4' : 'mr-4'}>
					<div
						class={msg.role === 'user'
							? 'rounded-l-lg rounded-tr-lg bg-primary text-primary-foreground'
							: 'rounded-tl-lg rounded-r-lg bg-muted'}
					>
						<p class="p-2 text-[11px] leading-snug">{msg.content}</p>
					</div>
					<p class="mt-0.5 text-[8px] text-muted-foreground uppercase">
						{msg.role} • {msg.timestamp}
					</p>
				</div>
			{/each}
		</div>

		<div class="space-y-2 border-t bg-muted/10 p-3">
			<Textarea
				bind:value={chatInput}
				placeholder="Ask AI..."
				class="min-h-[60px] border-none bg-background text-[11px] ring-offset-0 focus-visible:ring-1"
			/>
			<Button size="sm" class="h-8 w-full text-[11px]" onclick={handleSendMessage}>
				Send Message
			</Button>
		</div>
	</div>

	<!-- Quick Actions Panel -->
	<div class="rounded-xl border bg-card/50 p-4 shadow-sm">
		<h3 class="mb-3 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
			Quick Actions
		</h3>
		<div class="grid grid-cols-2 gap-2">
			<Button
				variant="outline"
				size="sm"
				class="h-7 text-[9px] font-bold uppercase"
				onclick={handleNewStrategy}>New Strategy</Button
			>
			<Button
				variant="outline"
				size="sm"
				class="h-7 text-[9px] font-bold uppercase"
				onclick={handleNewBacktest}>New Backtest</Button
			>
			<Button
				variant="outline"
				size="sm"
				class="h-7 text-[9px] font-bold uppercase"
				onclick={() => (appState.activeSection = 'performance-result')}>Report</Button
			>
			<Button
				variant="outline"
				size="sm"
				class="h-7 text-[9px] font-bold uppercase"
				onclick={handleExportCSV}>Export CSV</Button
			>
		</div>
	</div>
</aside>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
