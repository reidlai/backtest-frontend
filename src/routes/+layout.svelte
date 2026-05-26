<script lang="ts">
	import type { Snapshot } from '@sveltejs/kit';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { Toaster } from '$lib/components/ui/sonner';
	import NavigationSidebar from '$lib/components/organisms/NavigationSidebar.svelte';
	import AIReviewSidebar from '$lib/components/organisms/AIReviewSidebar.svelte';
	import { z } from 'zod';
	import { AIChatPanelSchema, ChatMessageSchema } from '$lib/schemas';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	type ChatMessage = z.infer<typeof ChatMessageSchema>;

	let { children } = $props();

	let messages = $state<ChatMessage[]>([]);
	let chatInput = $state('');

	export const snapshot: Snapshot = {
		capture: () => ({ messages: messages.slice(-50), chatInput }),
		restore: (value: unknown) => {
			const result = AIChatPanelSchema.safeParse(value);
			if (result.success) {
				messages = result.data.messages;
				chatInput = result.data.chatInput;
			}
		}
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen w-full min-w-[1280px] overflow-hidden bg-background text-foreground">
	<!-- Left Sidebar (fixed 240px) -->
	<NavigationSidebar />

	<!-- Main Content (flexible) -->
	<div class="relative flex flex-1 flex-col overflow-y-auto">
		{@render children()}
	</div>

	<!-- Right Sidebar (fixed 280px) -->
	<AIReviewSidebar bind:messages bind:chatInput />
</div>

<Toaster position="top-right" />

<!-- SEO Locale links -->
<div style="display:none" aria-hidden="true">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
