import scryfall from 'scryfall-client';
import convertToScryfallOracleIds from './convert-to-scryfall-oracle-ids';

vi.mock('scryfall-client');

describe('convertToScryfallOracleIds', () => {
	beforeEach(() => {
		const fakeResults = [
			{ name: 'Some Card', oracle_id: 'abc' },
			{ name: 'Other Card', oracle_id: 'def' }
		];
		// @ts-expect-error got to force this to work because types aren't great
		fakeResults.warnings = ['Warning 1'];
		// @ts-expect-error got to force this to work because types aren't great
		fakeResults.not_found = [{ name: 'Yet another Card' }];
		vi.mocked(scryfall.getCollection).mockResolvedValue(fakeResults);
	});

	afterEach(() => {
		vi.mocked(scryfall.getCollection).mockReset();
	});

	it('looks up collection on Scryfall using only names', async () => {
		await convertToScryfallOracleIds({
			somecard: { qty: 1, name: 'Some Card' },
			othercard: { qty: 2, name: 'Other Card' }
		});

		expect(scryfall.getCollection).toHaveBeenCalledOnce();
		expect(scryfall.getCollection).toHaveBeenCalledWith([
			{ name: 'Some Card' },
			{ name: 'Other Card' }
		]);
	});

	it('returns oracle ids from results', async () => {
		const res = await convertToScryfallOracleIds({
			somecard: { qty: 1, name: 'Some Card' },
			othercard: { qty: 2, name: 'Other Card' }
		});

		expect(res.oracleIds.length).toBe(2);
		expect(res.oracleIds[0]).toBe('abc');
		expect(res.oracleIds[1]).toBe('def');
	});

	it('returns warnings from results', async () => {
		const res = await convertToScryfallOracleIds({
			somecard: { qty: 1, name: 'Some Card' },
			othercard: { qty: 2, name: 'Other Card' }
		});

		expect(res.warnings.length).toBe(1);
		expect(res.warnings[0]).toBe('Warning 1');
	});

	it('returns list of not found cards from results', async () => {
		const res = await convertToScryfallOracleIds({
			somecard: { qty: 1, name: 'Some Card' },
			othercard: { qty: 2, name: 'Other Card' }
		});

		expect(res.notFound.length).toBe(1);
		expect(res.notFound[0]).toEqual({ name: 'Yet another Card' });
	});
});
