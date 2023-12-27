import type scryfall from 'scryfall-client';
import buildScryfallQuery, { type LookupPricesOptions } from './build-scryfall-query';
import searchOnScryfall from './search-on-scryfall';

type ScryfallSearchResult = ReturnType<typeof scryfall.search>;

export const IDS_PER_SEARCH = 18;

export default async function searchScryfallInBatches(
	oracleIds: string[],
	options: LookupPricesOptions,
	batchProcessCompleteCallback: () => void
): ScryfallSearchResult {
	const batches = [];

	while (oracleIds.length) {
		const setOfOracleIds = oracleIds.splice(0, IDS_PER_SEARCH);
		const query = buildScryfallQuery(setOfOracleIds, options);
		batches.push(
			searchOnScryfall(query).then((payload) => {
				batchProcessCompleteCallback();
				return payload;
			})
		);
	}

	const result = await Promise.all(batches);

	const flattenedResult = result.flat();
	flattenedResult.sort((a, b) => (a.name > b.name ? 1 : -1));

	return flattenedResult as Awaited<ScryfallSearchResult>;
}
