<script lang="ts">
	import type { CardRow } from '$lib/convert-scryfall-results-to-deck-results';
	import { fade } from 'svelte/transition';

	export let card: CardRow | null;
	export let mouseEvent: MouseEvent;

	$: leftPosition = `${mouseEvent?.clientX + 50}px`;
	$: topPosition = `${mouseEvent?.clientY - 30}px`;
	$: altText = `${card?.name} card image`;
</script>

{#if card}
	<div
		transition:fade={{ duration: 100 }}
		data-testid="card-container"
		class="card-image-tooltip"
		style:left={leftPosition}
		style:top={topPosition}
	>
		<img src={card.image} alt={altText} />
	</div>
{/if}

<style lang="postcss">
	.card-image-tooltip {
		height: 340px;
		width: 244px;
		@apply overflow-hidden rounded-xl fixed z-50 pointer-events-none;
	}
</style>
