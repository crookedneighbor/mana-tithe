import { cardNameToDeckKey, type Deck } from './convert-raw-string-to-deck';
import searchOnScryfall from './search-on-scryfall';

type ScryfallSearchPayload = Awaited<ReturnType<typeof searchOnScryfall>>;
type ScryfallCard = ScryfallSearchPayload[number];

export type CardRow = {
	qty: number;
	name: string;
	price: number;
	image: string;
	scryfallLink: string;
	tcgPlayerLink: string;
};

export type DeckResultOptions = {
	ignorePriceOfBasicLands: boolean;
	ignorePriceOfTokens: boolean;
};

function findCardInDeckList(cardName: string, deck: Deck) {
	const cardKey = cardNameToDeckKey(cardName);
	const cardInDecklist = deck[cardKey];

	if (cardInDecklist) {
		return cardInDecklist;
	}
	const [firstHalf, secondHalf] = cardName.split(' // ');

	return deck[cardNameToDeckKey(firstHalf ?? '')] || deck[cardNameToDeckKey(secondHalf ?? '')];
}

async function findCheapestTokenPrint(tokenName: string) {
	const tokenPrints = await searchOnScryfall(
		`!"${tokenName}" include:extras prefer:usd-low t:token usd>0`
	);

	const cheapestTokenPrint = tokenPrints.reduce((cheapestSoFar, current) => {
		if (Number(cheapestSoFar.getPrice()) > Number(current.getPrice())) {
			return current;
		}
		return cheapestSoFar;
	});
	return cheapestTokenPrint;
}

function determinePrice(card: ScryfallCard, options: DeckResultOptions): number {
	const cardKey = cardNameToDeckKey(card.name);

	switch (cardKey) {
		case 'island':
		case 'forest':
		case 'mountain':
		case 'swamp':
		case 'plains':
			if (options.ignorePriceOfBasicLands) {
				return 0;
			}
			break;
		default:
	}

	if (card.type_line.includes('Token')) {
		if (options.ignorePriceOfTokens) {
			return 0;
		}
	}

	return Number(card.getPrice());
}

function formatCard(
	card: ScryfallCard,
	cardInDecklist: ReturnType<typeof findCardInDeckList>,
	options: DeckResultOptions
) {
	const price = determinePrice(card, options);
	const tcgPlayerLink = price && card.purchase_uris.tcgplayer;

	return {
		qty: cardInDecklist.qty,
		name: card.name,
		price,
		image: card.getImage(),
		scryfallLink: card.scryfall_uri,
		tcgPlayerLink
	};
}

async function findCards(card: ScryfallCard, deck: Deck, options: DeckResultOptions) {
	const cardInDecklist = findCardInDeckList(card.name, deck);
	const cards: CardRow[] = [];

	if (card.layout === 'double_faced_token' && !cardInDecklist.name.includes(' // ')) {
		for (let i = 0; i < card.card_faces.length; i++) {
			const faceInDecklist = findCardInDeckList(card.card_faces[i].name, deck);
			if (!faceInDecklist) {
				continue;
			}
			// look up cheapest print for each of them
			const cheapestToken = await findCheapestTokenPrint(faceInDecklist.name);
			cards.push(formatCard(cheapestToken, faceInDecklist, options));
		}
	} else {
		cards.push(formatCard(card, cardInDecklist, options));
	}

	return cards;
}

export default async function convertScryfallResultsToDeckResults(
	scryfallPayload: ScryfallSearchPayload,
	deck: Deck,
	options: DeckResultOptions
): Promise<CardRow[]> {
	const cardRows: CardRow[] = [];

	for (let i = 0; i < scryfallPayload.length; i++) {
		const originalCard = scryfallPayload[i];
		const cardInDecklist = findCardInDeckList(originalCard.name, deck);

		if (!cardInDecklist) {
			// TODO what???
			continue;
		}

		const cards = await findCards(originalCard, deck, options);

		cardRows.push(...cards);
	}

	return cardRows;
}
