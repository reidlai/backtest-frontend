<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EditMetricModal from '$lib/components/organisms/EditMetricModal.svelte';

	const { Story } = defineMeta({
		title: 'Organisms/EditMetricModal',
		component: EditMetricModal,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered',
			backgrounds: { default: 'dark' }
		},
		args: {
			tileId: 'total-return',
			initialValue: '12.5',
			onApply: (v: string) => console.log('onApply', v),
			onClose: () => console.log('onClose')
		}
	});
</script>

<!-- Closed: modal is not visible -->
<Story name="Closed" args={{ open: false }} />

<!-- Open with valid input pre-filled -->
<Story name="Open – Valid Input" args={{ open: true, initialValue: '12.5' }} />

<!-- Open with empty input (Apply disabled, no error shown) -->
<Story name="Open – Empty Input" args={{ open: true, initialValue: '' }} />
