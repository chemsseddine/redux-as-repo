import React from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { renderHook, act } from '@testing-library/react-hooks';
import repoReducer from '../core/repository';
import createNamespaceApi from '../core/repository/createNamespaceApi';

const reducer = combineReducers({
	repository: repoReducer,
});

const store = createStore(reducer, {});

const wrapper = ({ children }: any) => (
	<Provider store={store}>{children}</Provider>
);

describe('createNamespaceApi', () => {
	it('should return proper hooks', async () => {
		const hooks = createNamespaceApi({
			namespace: 'test',
			queries: {
				addTodo: {
					query: () => 'todos',
				},
				getTodos: {
					query: () => 'todos',
				},
			},
		});
		expect(hooks).toEqual({
			useAddTodo: expect.any(Function),
			useGetTodos: expect.any(Function),
		});
	});

	it('should dispatch an action when clicking on refetch', () => {
		const namespace = 'test';
		const methodName = 'getTodos';
		const hooks = createNamespaceApi({
			namespace: 'test',
			queries: {
				[methodName]: {
					query: () => 'todos',
				},
			},
		});
		const generatedNamespace = `${namespace}_${methodName}`;

		const { result } = renderHook(() => hooks.useGetTodos(), { wrapper });
		act(() => {
			result.current.refetch();
		});
		expect(store.getState()).toEqual(
			expect.objectContaining({
				repository: {
					[generatedNamespace]: {
						data: [],
						error: false,
						loading: true,
						success: false,
						trace: null,
						fullError: null,
					},
				},
			})
		);
	});

	it('should throw error with invalid arguments', () => {
		const hooks = createNamespaceApi({
			namespace: 'test',
			queries: {
				postTodo: {
					query: data => ({
						url: 'todos',
						config: {
							method: 'POST',
							data,
						},
					}),
				},
			},
		});

		const { result } = renderHook(() => hooks.usePostTodo(), { wrapper });
		const errorMessage =
			'Invalid Arguments , usePostTodo expected 1 required arguments , received 0';
		expect(() => result.current.refetch()).toThrow(errorMessage);
	});
});
