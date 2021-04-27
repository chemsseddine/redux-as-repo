import axios from 'axios';
import { runSaga, Saga } from 'redux-saga';
import { fetchDataSaga, updateRepoSaga } from '../core/repository/middleware';
import {
	FETCH_SUCCESS,
	FETCH_ERROR,
	FETCH_CLEAR,
	SAVE_UPDATE_REPOSITORY,
} from '../core/repository';
const format = require('string-template');

jest.mock('axios');

afterEach(() => {
	jest.clearAllMocks();
});

describe('fetchDataSaga', () => {
	it('should dispatch FETCH_SUCCESS', async () => {
		const namespace = 'test';
		const dispatched: any[] = [];
		const state = { repository: {} };
		const expectedResult = 'result';
		((axios as unknown) as jest.Mock).mockResolvedValue({
			data: expectedResult,
		});

		const result = await runSaga(
			{
				dispatch: action => dispatched.push(action),
				getState: () => state,
			},
			fetchDataSaga,
			{
				type: 'FETCH_INIT | FETCH_SUCCESS', // this doesnt matter since we are running saga manually
				options: {
					url: '/randomLink',
					namespace,
				},
			}
		);

		expect(dispatched).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: FETCH_SUCCESS,
					payload: expectedResult,
				}),
			])
		);
	});

	it('should dispatch FETCH_ERROR if axios call is rejected and dispatch error callback with error', async () => {
		const namespace = 'test';
		const dispatched: any[] = [];
		const state = { repository: {} };
		const errorMessage = 'message error';
		((axios as unknown) as jest.Mock).mockRejectedValue({
			message: errorMessage,
		});

		const result = await runSaga(
			{
				dispatch: action => dispatched.push(action),
				getState: () => state,
			},
			fetchDataSaga,
			{
				type: 'FETCH_INIT | FETCH_SUCCESS', // this doesnt matter since we are running saga manually
				options: {
					url: '/randomLink',
					namespace,
				},
			}
		);

		expect(dispatched).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: FETCH_ERROR,
					message: errorMessage,
				}),
			])
		);
	});

	it('should clear namespace if autoClear is present in fetch options', async () => {
		const namespace = 'test';
		const dispatched: any[] = [];
		const state = { repository: {} };
		const expectedResult = 'result';
		((axios as unknown) as jest.Mock).mockResolvedValue({
			data: expectedResult,
		});

		const result = await runSaga(
			{
				dispatch: action => dispatched.push(action),
				getState: () => state,
			},
			fetchDataSaga,
			{
				type: 'FETCH_INIT | FETCH_SUCCESS', // this doesnt matter since we are running saga manually
				options: {
					url: '/randomLink',
					namespace,
					autoClear: true,
				},
			}
		);

		expect(dispatched).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: FETCH_SUCCESS,
					payload: expectedResult,
				}),
				expect.objectContaining({
					type: FETCH_CLEAR,
					namespace,
				}),
			])
		);
	});

	it('should dispatch success callback action with the response data ', async () => {
		const namespace = 'test';
		const dispatched: any[] = [];
		const state = { repository: {} };
		const expectedResult = 'result';
		((axios as unknown) as jest.Mock).mockResolvedValue({
			data: expectedResult,
		});

		const successCb = (data: any) => ({ type: 'CALLBACK_SUCCESS', data });

		const result = await runSaga(
			{
				dispatch: action => dispatched.push(action),
				getState: () => state,
			},
			fetchDataSaga,
			{
				type: 'FETCH_INIT | FETCH_SUCCESS', // this doesnt matter since we are running saga manually
				options: {
					url: '/randomLink',
					namespace,
					successCb,
				},
			}
		);

		expect(dispatched).toEqual(
			expect.arrayContaining([
				expect.objectContaining(successCb(expectedResult)),
			])
		);
	});

	it('should format url with a selector ', async () => {
		const namespace = 'test';
		const dispatched: any[] = [];
		const projectId = 1;
		const url = '/randomLink/{projectId}';
		const formattedUrl = format(url, { projectId });
		const state = { repository: {}, projectId };
		const expectedResult = 'result';
		((axios as unknown) as jest.Mock).mockResolvedValue({
			data: expectedResult,
		});

		const result = await runSaga(
			{
				dispatch: action => dispatched.push(action),
				getState: () => state,
			},
			fetchDataSaga,
			{
				type: 'FETCH_INIT | FETCH_SUCCESS', // this doesnt matter since we are running saga manually
				options: {
					url,
					namespace,
					selector: state => ({ projectId: state.projectId }),
				},
			}
		);

		expect(axios).toHaveBeenCalledWith(
			expect.objectContaining({ url: formattedUrl })
		);
	});
});

describe('updateRepoSaga', () => {
	it('should format url with a selector ', async () => {
		const namespace = 'test';
		const dispatched: any[] = [];
		const namespaceState = { data: ['orange', 'green'] };
		const id = 4;
		const updatedValue = { ...namespaceState, id };
		const state = {
			repository: { [namespace]: namespaceState },
		};
		const result = await runSaga(
			{
				dispatch: action => dispatched.push(action),
				getState: () => state,
			},
			updateRepoSaga,
			{
				type: 'UPDATE_REPOSITORY', // this doesnt matter since we are running saga manually
				options: {
					compute: state => ({ ...state, id }),
					namespace,
				},
			}
		);
		expect(dispatched).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: SAVE_UPDATE_REPOSITORY,
					newValue: updatedValue,
					namespace,
				}),
			])
		);
	});
});
