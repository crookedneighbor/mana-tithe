<script lang="ts">
	import type { CardRow } from '$lib/convert-scryfall-results-to-deck-results';
	import { fade } from 'svelte/transition';
	import CardTooltip from './CardTooltip.svelte';

	interface Props {
		results?: CardRow[];
	}

	let { results = [] }: Props = $props();

	let tooltipCard: CardRow | null = $state();
	let tooltipMouseEvent: MouseEvent = $state();

	const moneyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	});

	let totalPriceAsNumber = $derived(
		results.reduce((total, row) => {
			return total + row.qty * Number(row.price);
		}, 0)
	);
	let totalPrice = $derived(moneyFormatter.format(totalPriceAsNumber));
	const rowPrice = (price: number, qty: number) => {
		return moneyFormatter.format(Number(price) * qty);
	};

	const handleCardHover = (card: CardRow, event: MouseEvent) => {
		if (window.innerWidth < 768) {
			// window is too small to bother with presenting card image
			return;
		}

		tooltipMouseEvent = event;
		tooltipCard = card;
	};

	const handleCardHoverOut = () => {
		tooltipCard = null;
	};
</script>

<div in:fade={{ delay: 301, duration: 300 }} out:fade={{ duration: 100 }}>
	<h2 class="text-center my-4" data-testid="total-price">Total: {totalPrice}</h2>

	{#if tooltipMouseEvent && tooltipCard}
		<CardTooltip mouseEvent={tooltipMouseEvent} card={tooltipCard} />
	{/if}

	<table>
		<thead>
			<tr>
				<th>Qty</th>
				<th>Name</th>
				<th>Price</th>
			</tr>
		</thead>
		<tbody data-testid="result-body">
			{#each results as card, index}
				<tr data-testid={`result-row-${index}`}>
					<td data-testid={`result-row-${index}-qty`}>{card.qty}</td>
					<td data-testid={`result-row-${index}-name`}
						><a
							onmousemove={(e) => {
								handleCardHover(card, e);
							}}
							onmouseout={handleCardHoverOut}
							onblur={handleCardHoverOut}
							href={card.scryfallLink}
							target="_blank">{card.name}</a
						></td
					>
					<td data-testid={`result-row-${index}-price`}>
						{#if card.tcgPlayerLink}
							<a href={card.tcgPlayerLink} target="_blank">{rowPrice(card.price, card.qty)}</a>
						{:else}
							{rowPrice(card.price, card.qty)}
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="postcss">
	table {
		@apply m-auto text-sm text-left border border-stone-300;
	}

	thead {
		@apply text-xs text-gray-700 uppercase bg-gray-50;
	}

	th {
		@apply px-6 py-3;
	}

	tbody tr {
		@apply bg-white border-b;
	}

	td {
		@apply px-6 py-4;
	}
</style>
