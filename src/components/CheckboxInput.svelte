<script lang="ts">
	export let label: string;
	export let id: string;
	export let checked: boolean;
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
