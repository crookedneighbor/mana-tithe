import buildScryfallQuery, { type LookupPricesOptions } from './build-scryfall-query';

describe('buildScryfallQuery', () => {
	let oraclesIds: string[];
	let options: LookupPricesOptions;

	beforeEach(() => {
		oraclesIds = ['abc', 'def'];
		options = {
			excludeGoldBordered: false,
			excludeOversized: false
		};
	});

	it('builds a query with provided oracle ids', () => {
		const query = buildScryfallQuery(oraclesIds, options);

		expect(query).toContain('(oracle_id:"abc" or oracle_id:"def")');
	});

	it('builds a query looking for the lowest usd price', () => {
		const query = buildScryfallQuery(oraclesIds, options);

		expect(query).toContain('prefer:usd-low usd>0');
	});

	it('excludes gold bordered cards when configured', () => {
		const originalQuery = buildScryfallQuery(oraclesIds, options);

		expect(originalQuery).not.toContain('-border:gold');

		options.excludeGoldBordered = true;

		const query = buildScryfallQuery(oraclesIds, options);

		expect(query).toContain('-border:gold');
	});

	it('excludes oversized cards when configured', () => {
		const originalQuery = buildScryfallQuery(oraclesIds, options);

		expect(originalQuery).not.toContain('not:oversized');

		options.excludeOversized = true;

		const query = buildScryfallQuery(oraclesIds, options);

		expect(query).toContain('not:oversized');
	});
});
