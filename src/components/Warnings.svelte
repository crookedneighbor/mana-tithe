<script lang="ts">
	import type convertToScryfallOracleIds from '$lib/convert-to-scryfall-oracle-ids';
	import { fade } from 'svelte/transition';

	interface Props {
		collection: Awaited<ReturnType<typeof convertToScryfallOracleIds>>;
	}

	let { collection }: Props = $props();
	let warningErrors = $derived(collection?.warnings);

	// @ts-expect-error doesn't have a great type definition for the not found stuff
	let notFoundErrors = $derived(
		collection?.notFound.map((card) => {
			return `${card.name} could not be found. Check your spelling.`;
		})
	);
	let showWarnings = $derived(
		collection && (notFoundErrors.length > 0 || warningErrors.length > 0)
	);
</script>

{#if showWarnings}
	<ul
		data-testid="warnings"
		transition:fade={{ duration: 100 }}
		class="warning-box"
		aria-live="polite"
	>
		{#each notFoundErrors as error}
			<li>{error}</li>
		{/each}
		{#each warningErrors as error}
			<li>{error}</li>
		{/each}
	</ul>
{/if}

<style lang="postcss">
	.warning-box {
		@apply bg-red-300 rounded p-4 my-4;
	}
</style>
