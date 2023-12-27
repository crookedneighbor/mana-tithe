import scryfall from 'scryfall-client';
import searchOnScryfall from './search-on-scryfall';

vi.mock('scryfall-client');

describe('searchOnScryfall', () => {
	beforeEach(() => {
		const fakeResults = [
			{ card_faces: [{ name: 'Card', oracle_id: 'abc' }] },
			{ card_faces: [{ name: 'Another Card', oracle_id: 'def' }] },
			{ card_faces: [{ name: 'Duplicate Card', oracle_id: 'abc' }] }
		];
		vi.mocked(scryfall.search).mockResolvedValue(fakeResults);
	});

	afterEach(() => {
		vi.mocked(scryfall.search).mockReset();
	});

	it('searches on Scryfall', async () => {
		await searchOnScryfall('query');

		expect(scryfall.search).toHaveBeenCalledOnce();
		expect(scryfall.search).toHaveBeenCalledWith('query');
	});

	it('filters out duplicates from reversible cards', async () => {
		const result = await searchOnScryfall('query');

		expect(result.length).toBe(2);
		expect(result[0]).toEqual({ card_faces: [{ name: 'Card', oracle_id: 'abc' }] });
		expect(result[1]).toEqual({ card_faces: [{ name: 'Another Card', oracle_id: 'def' }] });
	});
});
