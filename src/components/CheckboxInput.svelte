<script lang="ts">
	interface Props {
		label: string;
		id: string;
		checked: boolean;
	}

	let { label, id, checked = $bindable() }: Props = $props();
</script>

<label for={id}>
	<input {id} name={id} type="checkbox" bind:checked />
	{label}
</label>

<style lang="postcss">
	label {
		@apply block my-1 cursor-pointer;
	}

	label:hover {
		@apply text-stone-600;
	}
</style>
