<script>
	export let disabled = false;
</script>

<button {disabled}>Find Lowest Price of Deck</button>

<style lang="postcss">
	button {
		@apply block my-2 bg-action text-white p-3 rounded;
	}
	button:disabled {
		@apply brightness-50 cursor-not-allowed;
	}
</style>
