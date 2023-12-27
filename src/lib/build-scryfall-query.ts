export type LookupPricesOptions = {
	excludeGoldBordered: boolean;
	excludeOversized: boolean;
};

function buildExclusionQuery(options: LookupPricesOptions) {
	let excludeQuery = '';

	if (options.excludeGoldBordered) {
		excludeQuery += ' -border:gold ';
	}
	if (options.excludeOversized) {
		excludeQuery += ' not:oversized ';
	}

	return excludeQuery;
}

export default function buildScryfallQuery(oracleIds: string[], options: LookupPricesOptions) {
	const oracleIdQuery = oracleIds.map((id) => `oracle_id:"${id}"`).join(' or ');
	const excludeQuery = buildExclusionQuery(options);

	return `(${oracleIdQuery}) prefer:usd-low usd>0 ${excludeQuery}`;
}
