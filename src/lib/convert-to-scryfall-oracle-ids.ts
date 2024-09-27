import scryfall from 'scryfall-client';
import type { Deck } from './convert-raw-string-to-deck';

export default async function convertToScryfallOracleIds(deck: Deck) {
	const deckAsNames = Object.keys(deck).map((key) => {
		return { name: deck[key].name };
	});
	const collection = await scryfall.getCollection(deckAsNames);

	// Check for name mismatches and rerun the search if needed
	for (let i = 0; i < collection.length; i++) {
		let card = collection[i];
		if (card.name !== deckAsNames[i].name) {
			let search: any = await scryfall.get(
				"cards/search", 
				{ q: `!"${deckAsNames[i].name}" -is:split -is:flip -is:transform -is:meld -is:leveler -is:dfc -is:mdfc` }
			);
			collection[i] = search.data[0];
		}
	}

	const oracleIds = collection.map((c) => c.oracle_id);

	return {
		oracleIds,
		warnings: collection.warnings,
		notFound: collection.not_found
	};
}
