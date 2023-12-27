import { cardNameToDeckKey } from './convert-raw-string-to-deck';
import convertScryfallResultsToDeckResults from './convert-scryfall-results-to-deck-results';

function makeFakeScryfallResult(name: string, price = 0) {
	const uri = cardNameToDeckKey(name);
	return {
		name,
		getPrice: vi.fn().mockReturnValue(String(price)),
		getImage: vi.fn().mockReturnValue(`https://example.com/image/${uri}`),
		scryfall_uri: `https://example.com/scryfall/${uri}`,
		purchase_uris: {
			tcgplayer: `https://example.com/tcg/${uri}`
		}
	};
}

describe('convertScryfallResultsToDeckResults', () => {
	it('formats scryfall results into usable results', () => {
		const results = convertScryfallResultsToDeckResults(
			[
				makeFakeScryfallResult('Card A', 1),
				makeFakeScryfallResult('Card B', 2.76),
				makeFakeScryfallResult('Island', 3.5)
			] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
			{
				carda: {
					name: 'Card A',
					qty: 1
				},
				cardb: {
					name: 'Card B',
					qty: 2
				},
				island: {
					name: 'Island',
					qty: 3
				}
			},
			{
				ignorePriceOfBasicLands: false
			}
		);

		expect(results.length).toBe(3);
		expect(results[0]).toEqual({
			qty: 1,
			name: 'Card A',
			price: 1,
			image: 'https://example.com/image/carda',
			scryfallLink: 'https://example.com/scryfall/carda',
			tcgPlayerLink: 'https://example.com/tcg/carda'
		});
		expect(results[1]).toEqual({
			qty: 2,
			name: 'Card B',
			price: 2.76,
			image: 'https://example.com/image/cardb',
			scryfallLink: 'https://example.com/scryfall/cardb',
			tcgPlayerLink: 'https://example.com/tcg/cardb'
		});
		expect(results[2]).toEqual({
			qty: 3,
			name: 'Island',
			price: 3.5,
			image: 'https://example.com/image/island',
			scryfallLink: 'https://example.com/scryfall/island',
			tcgPlayerLink: 'https://example.com/tcg/island'
		});
	});

	it('ignores prices of basic lands when configured', () => {
		const results = convertScryfallResultsToDeckResults(
			[
				makeFakeScryfallResult('Card A', 1),
				makeFakeScryfallResult('Island', 2.76),
				makeFakeScryfallResult('Plains', 3.5),
				makeFakeScryfallResult('Mountain', 2.6),
				makeFakeScryfallResult('Swamp', 1.5),
				makeFakeScryfallResult('Forest', 2.5)
			] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
			{
				carda: {
					name: 'Card A',
					qty: 1
				},
				island: {
					name: 'Island',
					qty: 2
				},
				plains: {
					name: 'Plains',
					qty: 3
				},
				mountain: {
					name: 'Mountian',
					qty: 3
				},
				swamp: {
					name: 'Swamp',
					qty: 3
				},
				forest: {
					name: 'Forest',
					qty: 3
				}
			},
			{
				ignorePriceOfBasicLands: true
			}
		);

		expect(results.length).toBe(6);
		expect(results[0].price).toBe(1);
		expect(results[1].price).toBe(0);
		expect(results[2].price).toBe(0);
		expect(results[3].price).toBe(0);
		expect(results[4].price).toBe(0);
		expect(results[5].price).toBe(0);
	});
});
