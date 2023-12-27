export type DeckEntry = {
	qty: number;
	name: string;
};

export type Deck = Record<string, DeckEntry>;

function convertTextEntryToDeckEntry(entry: string): DeckEntry {
	const matches = entry.match(/^((\d*)([xX]?) )?(.*)$/);

	if (!matches) {
		return { qty: 0, name: '' };
	}

	const qty = Number(matches[2] || 1);
	const name = (matches[4] || '').split(/[/(]/)[0].trim();

	return {
		qty,
		name
	};
}

function isValidEntry(entry: DeckEntry) {
	return entry.qty > 0 && entry.name && entry.name.charAt(0) !== '/';
}

export function cardNameToDeckKey(cardName: string): string {
	return cardName
		.replaceAll(' ', '')
		.replace(/\/\/.*$/, '')
		.toLowerCase();
}

export default function convertRawStringToDeck(rawDeck: string): Deck {
	return rawDeck.split('\n').reduce(
		(accum: Deck, rawEntry: string) => {
			const entry = convertTextEntryToDeckEntry(rawEntry);

			if (isValidEntry(entry)) {
				accum[cardNameToDeckKey(entry.name)] = entry;
			}
			return accum;
		},
		<Deck>{}
	);
}
