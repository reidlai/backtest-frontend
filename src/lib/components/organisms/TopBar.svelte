<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as m from '$lib/paraglide/messages';
	import { getLocale, setLocale } from '$lib/paraglide/runtime';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { strategyState } from '$lib/state/strategy.svelte';

	function toggleLanguage() {
		const newLocale = getLocale() === 'en' ? 'zh-TW' : 'en';
		setLocale(newLocale);
	}

	function handleSave() {
		toast.success(m.save_success());
	}

	function handleExportJSON() {
		const config = strategyState.getStrategyConfig();
		const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'strategy.json';
		a.click();
		URL.revokeObjectURL(url);
		toast.success('JSON Exported');
	}

	function handleSendToAI() {
		goto('/strategy-builder');
	}
</script>

<header
	class="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/50 px-6 backdrop-blur-md"
>
	<div class="flex w-full max-w-md items-center gap-2">
		<div class="relative w-full">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="absolute top-2.5 left-2.5 text-muted-foreground"
				><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
			>
			<Input
				type="search"
				placeholder={m.search_placeholder()}
				class="h-9 w-full border-none bg-muted/50 pl-9 focus-visible:ring-1"
			/>
		</div>
	</div>

	<div class="flex items-center gap-2">
		<Button variant="ghost" size="sm" onclick={toggleLanguage}>
			{getLocale() === 'en' ? m.language_en() : m.language_zh_tw()}
		</Button>
		<Button variant="outline" size="sm" onclick={handleSave}>
			{m.save()}
		</Button>
		<Button variant="outline" size="sm" onclick={handleExportJSON}>
			{m.export_json()}
		</Button>
		<Button
			variant="default"
			size="sm"
			class="bg-primary text-primary-foreground hover:bg-primary/90"
			onclick={handleSendToAI}
		>
			{m.send_to_ai()}
		</Button>
	</div>
</header>
