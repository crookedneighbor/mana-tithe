import convertRawStringToDeck, { cardNameToDeckKey } from './convert-raw-string-to-deck';

describe('convertawStringToDeck', () => {
	it('filters out blank entries', () => {
		const rawDeck = `1 Island

2 Plains`;

		const deck = convertRawStringToDeck(rawDeck);

		expect(Object.keys(deck).length).toBe(2);
		expect(deck.island.name).toBe('Island');
		expect(deck.plains.name).toBe('Plains');
	});

	it('filters out entries comprised of only spaces', () => {
		const rawDeck = `1 Island
		
2 Plains`;

		const deck = convertRawStringToDeck(rawDeck);

		expect(Object.keys(deck).length).toBe(2);
		expect(deck.island.name).toBe('Island');
		expect(deck.plains.name).toBe('Plains');
	});

	it('filters out entries starting with a / (denoting a comment or deck section)', () => {
		const rawDeck = `1 Island
// comment
/ lazy comment
2 Plains`;

		const deck = convertRawStringToDeck(rawDeck);

		expect(Object.keys(deck).length).toBe(2);
		expect(deck.island.name).toBe('Island');
		expect(deck.plains.name).toBe('Plains');
	});

	it('trims excess space from names', () => {
		const rawDeck = `1   Island    
2    Plains `;

		const deck = convertRawStringToDeck(rawDeck);

		expect(Object.keys(deck).length).toBe(2);
		expect(deck.island.name).toBe('Island');
		expect(deck.plains.name).toBe('Plains');
	});

	it('extracts name and quantity', () => {
		const rawDeck = `1 Island
201 Plains`;

		const deck = convertRawStringToDeck(rawDeck);

		expect(Object.keys(deck).length).toBe(2);
		expect(deck.island.name).toBe('Island');
		expect(deck.island.qty).toBe(1);
		expect(deck.plains.name).toBe('Plains');
		expect(deck.plains.qty).toBe(201);
	});

	it('allows quantity in the form <n>x/<n>X', () => {
		const rawDeck = `1x Island
201X Plains`;

		const deck = convertRawStringToDeck(rawDeck);

		expect(Object.keys(deck).length).toBe(2);
		expect(deck.island.name).toBe('Island');
		expect(deck.island.qty).toBe(1);
		expect(deck.plains.name).toBe('Plains');
		expect(deck.plains.qty).toBe(201);
	});

	it('strips out comments after card name', () => {
		const rawDeck = `1 Island // comment about island
2 Plains (comment about plains)`;

		const deck = convertRawStringToDeck(rawDeck);

		expect(Object.keys(deck).length).toBe(2);
		expect(deck.island.name).toBe('Island');
		expect(deck.plains.name).toBe('Plains');
	});

	it('defaults quantity to 1', () => {
		const rawDeck = `Island
Plains`;

		const deck = convertRawStringToDeck(rawDeck);

		expect(Object.keys(deck).length).toBe(2);
		expect(deck.island.name).toBe('Island');
		expect(deck.island.qty).toBe(1);
		expect(deck.plains.name).toBe('Plains');
		expect(deck.plains.qty).toBe(1);
	});

	it('eliminates invalid entries', () => {
		const rawDeck = `1 Island
3 
0 Swamp
2 Plains`;

		const deck = convertRawStringToDeck(rawDeck);

		expect(Object.keys(deck).length).toBe(2);
		expect(deck.island.name).toBe('Island');
		expect(deck.island.qty).toBe(1);
		expect(deck.plains.name).toBe('Plains');
		expect(deck.plains.qty).toBe(2);
	});

	describe('cardNameToDeckKey', () => {
		it('removes spaces', () => {
			expect(cardNameToDeckKey('a b c')).toBe('abc');
		});

		it('lowercaes', () => {
			expect(cardNameToDeckKey('ABC')).toBe('abc');
		});

		it('removes second name from card name', () => {
			expect(cardNameToDeckKey('Abc // Def')).toBe('abc');
		});
	});
});
