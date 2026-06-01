<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { sampleSentimentEvents } from '$lib/shared-mockdata/sentiment';
	import SentimentEventsTable from '$lib/components/organisms/SentimentEventsTable.svelte';
</script>

<div class="space-y-6 p-6">
	<h1 class="text-3xl font-bold tracking-tight">{m.sentiment_events()}</h1>

	<SentimentEventsTable events={sampleSentimentEvents} />
</div>
