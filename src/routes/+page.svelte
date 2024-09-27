<script lang="ts">
	import convertRawStringToDeck, { type Deck } from '$lib/convert-raw-string-to-deck';
	import DeckInput from '../components/DeckInput.svelte';
	import ExclusionOptions from '../components/ExclusionOptions.svelte';
	import ProgressBar from '../components/ProgressBar.svelte';
	import Results from '../components/Results.svelte';
	import SubmitButton from '../components/SubmitButton.svelte';

	import searchScryfallInBatches, { IDS_PER_SEARCH } from '$lib/search-scryfall-in-batches';
	import convertToScryfallOracleIds from '$lib/convert-to-scryfall-oracle-ids';
	import convertScryfallResultsToDeckResults, {
		type CardRow
	} from '$lib/convert-scryfall-results-to-deck-results';
	import Warnings from '../components/Warnings.svelte';

	let decklist = '';

	let ignoreBasicLands = true;
	let ignoreTokens = true;
	let excludeGoldBordered = true;
	let excludeOversized = true;

	let lookupInProgress = false;
	let progress = 0;
	let maxProgress = 0;
	let collection: Awaited<ReturnType<typeof convertToScryfallOracleIds>>;

	async function gatherResults(deck: Deck) {
		collection = await convertToScryfallOracleIds(deck);
		progress = progress + 1;

		const payload = await searchScryfallInBatches(
			collection.oracleIds,
			{
				excludeGoldBordered,
				excludeOversized
			},
			() => {
				progress = progress + 1;
			}
		);

		return convertScryfallResultsToDeckResults(payload, deck, {
			ignorePriceOfBasicLands: ignoreBasicLands,
			ignorePriceOfTokens: ignoreTokens
		});
	}
	let searchPromise: Promise<CardRow[]>;

	const submit = async (e: SubmitEvent) => {
		e.preventDefault();

		lookupInProgress = true;

		const deck = convertRawStringToDeck(decklist);

		progress = 0;

		// include an extra one for the getCollection request
		maxProgress = Math.ceil(Object.keys(deck).length / IDS_PER_SEARCH) + 1;

		searchPromise = gatherResults(deck);
		await searchPromise;

		lookupInProgress = false;
	};
</script>

<div class="container">
	<h1>Mana Tithe</h1>
	<h2>Find the cheapest version of a Magic: the Gathering deck list.</h2>

	<p>
		Paste in your deck list and look up each printing of the card and find the print with the lowest <a
			href="https://store.tcgplayer.com/help/marketprice"
			target="_blank">TCGPlayer Market Price</a
		>, the price a card has recently been selling at. It does not guarantee you'll find a card for
		exactly that price.
	</p>

	<p>
		This tool is intended to assist in budget brewing. The price calculation does not account for
		the cost of shipping from various storefronts, so the actual cost of the deck if purchased all
		at once will likely be substantially higher.
	</p>

	<form on:submit={submit}>
		<DeckInput bind:decklist />
		{#if collection}
			<Warnings {collection} />
		{/if}

		<ExclusionOptions bind:ignoreBasicLands bind:ignoreTokens bind:excludeGoldBordered bind:excludeOversized />

		<SubmitButton disabled={lookupInProgress} />
	</form>

	{#if searchPromise}
		{#await searchPromise}
			<ProgressBar bind:progress bind:maxProgress />
		{:then results}
			{#if results.length > 0}
				<Results {results} />
			{/if}
		{/await}
	{/if}
</div>

<style lang="postcss">
	:global(html) {
		@apply bg-amber-50 text-stone-800;
	}

	.container {
		@apply max-w-4xl m-auto p-4;
	}
</style>
