<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ScheduleExecutionConfig from '$lib/components/organisms/ScheduleExecutionConfig.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/ScheduleExecutionConfig',
		component: ScheduleExecutionConfig,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<Story name="Default" />
