import scryfall from 'scryfall-client';

type OracleIDCache = Record<string, boolean>;

export default async function searchOnScryfall(query: string) {
	const result = await scryfall.search(query);

	// the SLD full deck has a peculiar quirk, where some magic cards have the same oracle id for 2 faces
	// Scryfall surfaces those cards as unique cards as far as the search goes, so we need to filter them
	// out when presenting to the end user
	// https://github.com/crookedneighbor/mana-tithe/issues/23
	const ids: OracleIDCache = {};
	const payload = result.filter((entry) => {
		const oracleId = entry.card_faces[0].oracle_id;

		if (!ids[oracleId]) {
			ids[oracleId] = true;
			return true;
		}
		return false;
	});

	return payload;
}
