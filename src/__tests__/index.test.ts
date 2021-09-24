import reducer, {
	FETCH_INIT,
	FETCH_LATEST,
	FETCH_CLEAR,
	FETCH_NEW_INIT,
	FETCH_SUCCESS,
	createNamespaceState,
	SAVE_UPDATE_REPOSITORY,
	repositorySelector,
} from '../core/repository';

import {
	InitAction,
	ClearAction,
	SuccessAction,
	ErrorAction,
	UpdateAction,
} from '../core/repository/types';

describe('repository reducer', () => {
	const initialState = {};
	const namespace = 'test';

	it('should return initialNamespace State for FETCH_INIT and FETCH_LATEST', () => {
		const types = [FETCH_INIT, FETCH_LATEST];
		// pick a random type from types list
		const type = types[Math.floor(Math.random() * types.length)];

		const action = { type, options: { namespace } };
		const expectedState = createNamespaceState();
		// loading should be set to true;
		expectedState.loading = true;
		const returnedState = reducer(initialState, action as InitAction);
		expect(returnedState).toEqual({ [namespace]: expectedState });
	});

	it('should return previous namespace state for FETCH_INIT and FETCH_LATEST if namespace exists', () => {
		const types = [FETCH_INIT, FETCH_LATEST];
		// pick a random type from types list
		const type = types[Math.floor(Math.random() * types.length)];

		const action = { type, options: { namespace } };
		const data = ['orange'];
		const previousState = {
			[namespace]: { ...createNamespaceState(), data },
		};
		const expectedState = createNamespaceState();
		// loading should be set to true;
		expectedState.loading = true;
		const returnedState = reducer(previousState, action as InitAction);
		expect(returnedState).toEqual({
			[namespace]: { ...expectedState, data },
		});
	});
	it('should return new namespace state for FETCH_NEW_INIT if namespace exists', () => {
		const action = { type: FETCH_NEW_INIT, options: { namespace } };
		const data = ['orange'];
		const previousState = {
			[namespace]: { ...createNamespaceState(), data },
		};
		const expectedState = createNamespaceState();
		// loading should be set to true;
		expectedState.loading = true;
		const returnedState = reducer(previousState, action as InitAction);
		expect(returnedState).toEqual({
			[namespace]: expectedState,
		});
	});

	it('should clear namespace for FETCH_CLEAR', () => {
		const action = { type: FETCH_CLEAR, namespace };
		const state = { [namespace]: createNamespaceState() };
		const returnedState = reducer(state, action as ClearAction);
		expect(returnedState).toEqual({});
	});

	it('should save data in FETCH_SUCCESS ', () => {
		const payload = [{ id: 1, name: 'project id' }];
		const action = { type: FETCH_SUCCESS, namespace, payload };
		const namespaceState = createNamespaceState();
		const state = { [namespace]: namespaceState };
		const returnedState = reducer(state, action as SuccessAction);
		const updateNamespace = {
			...namespaceState,
			data: payload,
			loading: false,
			success: true,
		};
		expect(returnedState).toEqual({ [namespace]: updateNamespace });
	});

	it('should add/update key inside namespace state', () => {
		const newValue = { key: 'value' };
		const action = {
			type: SAVE_UPDATE_REPOSITORY,
			namespace,
			newValue,
		};
		const returnedState = reducer({}, action as UpdateAction);
		expect(returnedState).toEqual({ [namespace]: newValue });
	});

	it('should pass initialState', () => {
		const initialState = { key: 'value' };
		const namespaceState = createNamespaceState(initialState);
		namespaceState.loading = true;
		const types = [FETCH_INIT, FETCH_LATEST];
		// pick a random type from types list
		const type = types[Math.floor(Math.random() * types.length)];
		const action = {
			type,
			options: {
				initialState,
				namespace,
			},
		};

		const returnedState = reducer({}, action);
		expect(returnedState).toEqual({ [namespace]: namespaceState });
	});
});

describe('selector creators', () => {
	it('repositorySelector, return empty object', () => {
		const state = { repository: {} };
		const data = repositorySelector(state);
		expect(data).toEqual({});
	});

	it('repositorySelector, throw an error if repository key is not present', () => {
		const state = {};
		const repoWrapperSelector = () => repositorySelector(state);
		expect(repoWrapperSelector).toThrowError();
	});
});
