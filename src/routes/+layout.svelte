<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { Toaster } from '$lib/components/ui/sonner';
	import NavigationSidebar from '$lib/components/organisms/NavigationSidebar.svelte';
	import AIReviewSidebar from '$lib/components/organisms/AIReviewSidebar.svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
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
	<AIReviewSidebar />
</div>

<Toaster position="top-right" />

<!-- SEO Locale links -->
<div style="display:none" aria-hidden="true">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
