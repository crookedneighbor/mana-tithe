import { cardNameToDeckKey } from './convert-raw-string-to-deck';
import convertScryfallResultsToDeckResults from './convert-scryfall-results-to-deck-results';
import searchOnScryfall from './search-on-scryfall';

vi.mock('./search-on-scryfall');

type ScryfallResultOptions = {
	price?: number;
	layout?: string;
	typeLine?: string;
};

function makeFakeScryfallResult(name: string, options: ScryfallResultOptions) {
	const uri = cardNameToDeckKey(name);
	const cardFaces = name.split(' // ').map((faceName) => ({
		name: faceName
	}));
	return {
		name,
		card_faces: cardFaces,
		getPrice: vi.fn().mockReturnValue(String(options.price || 0)),
		getImage: vi.fn().mockReturnValue(`https://example.com/image/${uri}`),
		scryfall_uri: `https://example.com/scryfall/${uri}`,
		layout: options.layout || 'layout',
		type_line: options.typeLine || 'Card',
		purchase_uris: {
			tcgplayer: `https://example.com/tcg/${uri}`
		}
	};
}

describe('convertScryfallResultsToDeckResults', () => {
	it('formats scryfall results into usable results', async () => {
		const results = await convertScryfallResultsToDeckResults(
			[
				makeFakeScryfallResult('Card A', { price: 1 }),
				makeFakeScryfallResult('Card B', { price: 2.76 }),
				makeFakeScryfallResult('Island', { price: 3.5 }),
				makeFakeScryfallResult('Token', { price: 5.12, typeLine: 'Token Creature' })
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
				},
				token: {
					name: 'Token',
					qty: 1
				}
			},
			{
				ignorePriceOfBasicLands: false,
				ignorePriceOfTokens: false
			}
		);

		expect(results.length).toBe(4);
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
		expect(results[3]).toEqual({
			qty: 1,
			name: 'Token',
			price: 5.12,
			image: 'https://example.com/image/token',
			scryfallLink: 'https://example.com/scryfall/token',
			tcgPlayerLink: 'https://example.com/tcg/token'
		});
	});

	it('handles double faced cards where only one face was provided in decklist', async () => {
		const results = await convertScryfallResultsToDeckResults(
			[
				makeFakeScryfallResult('Front // Back', { price: 1 }),
				makeFakeScryfallResult('Front 2 // Back 2', { price: 2.76 })
			] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
			{
				front: {
					name: 'Front',
					qty: 1
				},
				back2: {
					name: 'Back 2',
					qty: 2
				}
			},
			{
				ignorePriceOfBasicLands: false,
				ignorePriceOfTokens: false
			}
		);

		expect(results.length).toBe(2);
		expect(results[0]).toEqual({
			qty: 1,
			name: 'Front // Back',
			price: 1,
			image: 'https://example.com/image/front',
			scryfallLink: 'https://example.com/scryfall/front',
			tcgPlayerLink: 'https://example.com/tcg/front'
		});
		expect(results[1]).toEqual({
			qty: 2,
			name: 'Front 2 // Back 2',
			price: 2.76,
			image: 'https://example.com/image/front2',
			scryfallLink: 'https://example.com/scryfall/front2',
			tcgPlayerLink: 'https://example.com/tcg/front2'
		});
	});

	it('handles double faced tokens by refetching the cards for the cheapest print', async () => {
		vi.mocked(searchOnScryfall).mockResolvedValue([
			makeFakeScryfallResult('Print 1', { price: 10 }),
			makeFakeScryfallResult('Print 2', { price: 5 }),
			makeFakeScryfallResult('Print 3', { price: 7 })
		]);

		const results = await convertScryfallResultsToDeckResults(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			[makeFakeScryfallResult('Front // Back', { price: 1, layout: 'double_faced_token' })] as any,
			{
				front: {
					name: 'Front',
					qty: 1
				}
			},
			{
				ignorePriceOfBasicLands: false,
				ignorePriceOfTokens: false
			}
		);

		expect(searchOnScryfall).toBeCalledWith('!"Front" include:extras prefer:usd-low t:token usd>0');
		expect(results.length).toBe(1);
		expect(results[0]).toEqual({
			qty: 1,
			name: 'Print 2',
			price: 5,
			image: 'https://example.com/image/print2',
			scryfallLink: 'https://example.com/scryfall/print2',
			tcgPlayerLink: 'https://example.com/tcg/print2'
		});
	});

	it('handles double faced tokens by when both faces are included in the deck list', async () => {
		vi.mocked(searchOnScryfall).mockResolvedValueOnce([
			makeFakeScryfallResult('Front Print 1', { price: 10 }),
			makeFakeScryfallResult('Front Print 2', { price: 5 }),
			makeFakeScryfallResult('Front Print 3', { price: 7 })
		]);
		vi.mocked(searchOnScryfall).mockResolvedValueOnce([
			makeFakeScryfallResult('Back Print 1', { price: 1 }),
			makeFakeScryfallResult('Back Print 2', { price: 2 }),
			makeFakeScryfallResult('Back Print 3', { price: 3 })
		]);

		const results = await convertScryfallResultsToDeckResults(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			[makeFakeScryfallResult('Front // Back', { price: 1, layout: 'double_faced_token' })] as any,
			{
				front: {
					name: 'Front',
					qty: 1
				},
				back: {
					name: 'Back',
					qty: 2
				}
			},
			{
				ignorePriceOfBasicLands: false,
				ignorePriceOfTokens: false
			}
		);

		expect(searchOnScryfall).toBeCalledWith('!"Front" include:extras prefer:usd-low t:token usd>0');
		expect(searchOnScryfall).toBeCalledWith('!"Back" include:extras prefer:usd-low t:token usd>0');
		expect(results.length).toBe(2);
		expect(results[0]).toEqual({
			qty: 1,
			name: 'Front Print 2',
			price: 5,
			image: 'https://example.com/image/frontprint2',
			scryfallLink: 'https://example.com/scryfall/frontprint2',
			tcgPlayerLink: 'https://example.com/tcg/frontprint2'
		});
		expect(results[1]).toEqual({
			qty: 2,
			name: 'Back Print 1',
			price: 1,
			image: 'https://example.com/image/backprint1',
			scryfallLink: 'https://example.com/scryfall/backprint1',
			tcgPlayerLink: 'https://example.com/tcg/backprint1'
		});
	});

	it('ignores prices of basic lands when configured', async () => {
		const results = await convertScryfallResultsToDeckResults(
			[
				makeFakeScryfallResult('Card A', { price: 1 }),
				makeFakeScryfallResult('Island', { price: 2.76 }),
				makeFakeScryfallResult('Plains', { price: 3.5 }),
				makeFakeScryfallResult('Mountain', { price: 2.6 }),
				makeFakeScryfallResult('Swamp', { price: 1.5 }),
				makeFakeScryfallResult('Forest', { price: 2.5 })
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
				ignorePriceOfBasicLands: true,
				ignorePriceOfTokens: false
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

	it('ignores prices of tokens when configured', async () => {
		const results = await convertScryfallResultsToDeckResults(
			[
				makeFakeScryfallResult('Card A', { price: 1 }),
				makeFakeScryfallResult('Creature Token', { price: 2.76, typeLine: 'Token Creature' }),
				makeFakeScryfallResult('Artifact Token', { price: 3.5, typeLine: 'Token Artifact' })
			] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
			{
				carda: {
					name: 'Card A',
					qty: 1
				},
				creaturetoken: {
					name: 'Creature Token',
					qty: 2
				},
				artifacttoken: {
					name: 'Artifact Token',
					qty: 3
				}
			},
			{
				ignorePriceOfBasicLands: false,
				ignorePriceOfTokens: true
			}
		);

		expect(results.length).toBe(3);
		expect(results[0].price).toBe(1);
		expect(results[1].price).toBe(0);
		expect(results[2].price).toBe(0);
	});
});
