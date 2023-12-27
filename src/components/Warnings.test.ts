import { render, screen } from '@testing-library/svelte';
import Warnings from './Warnings.svelte';
import type convertToScryfallOracleIds from '$lib/convert-to-scryfall-oracle-ids';

describe('Warnings', () => {
	let collection: Awaited<ReturnType<typeof convertToScryfallOracleIds>>;

	beforeEach(() => {
		collection = {
			oracleIds: [],
			notFound: [],
			warnings: []
		};
	});

	it('does not display if no collection is passed', () => {
		render(Warnings, {
			props: {
				// @ts-expect-error need to force not having it available
				collection: null
			}
		});

		const warningsUl = screen.queryByTestId('warnings');

		expect(warningsUl).toBeFalsy();
	});

	it('does not display if collection has no warnings or not found cards', () => {
		render(Warnings, {
			props: { collection }
		});

		const warningsUl = screen.queryByTestId('warnings');

		expect(warningsUl).toBeFalsy();
	});

	it('displays not found info', () => {
		collection.notFound = [{ name: 'card name A' }, { name: 'card name B' }];
		render(Warnings, {
			props: { collection }
		});

		const warningsUl = screen.getByTestId('warnings');

		expect(warningsUl).toBeTruthy();

		const lis = warningsUl.querySelectorAll('li');

		expect(lis.length).toEqual(2);
		expect(lis[0].textContent).toEqual('card name A could not be found. Check your spelling.');
		expect(lis[1].textContent).toEqual('card name B could not be found. Check your spelling.');
	});

	it('displays warnings info', () => {
		collection.warnings = ['warning A', 'warning B'];
		render(Warnings, {
			props: { collection }
		});

		const warningsUl = screen.getByTestId('warnings');

		expect(warningsUl).toBeTruthy();

		const lis = warningsUl.querySelectorAll('li');

		expect(lis.length).toEqual(2);
		expect(lis[0].textContent).toEqual('warning A');
		expect(lis[1].textContent).toEqual('warning B');
	});

	it('displays not found info first', () => {
		collection.notFound = [{ name: 'card name A' }, { name: 'card name B' }];
		collection.warnings = ['warning A', 'warning B'];
		render(Warnings, {
			props: { collection }
		});

		const warningsUl = screen.getByTestId('warnings');

		expect(warningsUl).toBeTruthy();

		const lis = warningsUl.querySelectorAll('li');

		expect(lis.length).toEqual(4);
		expect(lis[0].textContent).toEqual('card name A could not be found. Check your spelling.');
		expect(lis[1].textContent).toEqual('card name B could not be found. Check your spelling.');
		expect(lis[2].textContent).toEqual('warning A');
		expect(lis[3].textContent).toEqual('warning B');
	});
});
