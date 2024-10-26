<script lang="ts">
	export let decklist: string;
</script>

<div>
	<label for="deck-input" class="sr-only">Decklist</label>
	<textarea id="deck-input" placeholder="1 Card Name" bind:value={decklist}></textarea>
</div>

<style lang="postcss">
	textarea {
		@apply w-full bg-white rounded h-52 border-stone-300 border p-2;
	}
</style>
