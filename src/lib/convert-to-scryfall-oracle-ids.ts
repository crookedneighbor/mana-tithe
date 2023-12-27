import scryfall from 'scryfall-client';
import type { Deck } from './convert-raw-string-to-deck';

export default async function convertToScryfallOracleIds(deck: Deck) {
	const deckAsNames = Object.keys(deck).map((key) => {
		return { name: deck[key].name };
	});
	const collection = await scryfall.getCollection(deckAsNames);
	const oracleIds = collection.map((c) => c.oracle_id);

	return {
		oracleIds,
		warnings: collection.warnings,
		notFound: collection.not_found
	};
}
