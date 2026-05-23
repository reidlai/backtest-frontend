<script lang="ts">

	import NavigationSidebarHeader from '$lib/components/molecules/NavigationSidebarHeader.svelte'
  import MainMenuGroup from '$lib/components/organisms/MainMenuGroup.svelte'
  import ResultMenuGroup from '$lib/components/organisms/ResultMenuGroup.svelte'
  import LiveControlForm  from '$lib/components/organisms/LiveControlForm.svelte';

</script>

<aside class="flex h-full w-60 flex-col border-r bg-card/50 backdrop-blur-xl">

	<NavigationSidebarHeader />

	<div class="flex-1 space-y-6 overflow-y-auto p-4">
		<MainMenuGroup />

		<ResultMenuGroup />

		<LiveControlForm />

	</div>
</aside>
