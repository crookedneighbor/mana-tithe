import type scryfall from 'scryfall-client';
import { cardNameToDeckKey, type Deck } from './convert-raw-string-to-deck';

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
};

export default function convertScryfallResultsToDeckResults(
    scryfallPayload: Awaited<ReturnType<typeof scryfall.search>>,
    deck: Deck,
    options: DeckResultOptions
): CardRow[] {
    return scryfallPayload.map((card) => {
        const cardKey = cardNameToDeckKey(card.name);
        const cardInDecklist = deck[cardKey];

		// Handle the case where the card is not in the decklist
        if (!cardInDecklist) {
            return {
                qty: 0,
                name: card.name,
                price: 0,
                image: card.getImage(),
                scryfallLink: card.scryfall_uri,
                tcgPlayerLink: ''
            };
        }

        let price = Number(card.getPrice());
        let tcgPlayerLink = card.purchase_uris.tcgplayer;

        switch (cardKey) {
            case 'island':
            case 'forest':
            case 'mountain':
            case 'swamp':
            case 'plains':
                if (options.ignorePriceOfBasicLands) {
                    price = 0;
                    tcgPlayerLink = '';
                }
                break;
            default:
        }

        return {
            qty: cardInDecklist.qty,
            name: card.name,
            price,
            image: card.getImage(),
            scryfallLink: card.scryfall_uri,
            tcgPlayerLink
        };
    });
}
