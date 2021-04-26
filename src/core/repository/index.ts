import { AxiosRequestConfig } from 'axios';
import { createSelector } from 'reselect';

export const FETCH_INIT = 'instarux/repo/FETCH_INIT';
export const FETCH_SUCCESS = 'instarux/repo/FETCH_SUCCESS';
export const FETCH_ERROR = 'instarux/repo/FETCH_ERROR';
export const FETCH_LATEST = 'instarux/repo/FETCH_LATEST';
export const FETCH_CLEAR = 'instarux/repo/FETCH_CLEAR';
export const UPDATE_REPOSITORY = 'instarux/repo/UPDATE_REPOSITORY';
export const UPDATE_FAILED = 'instarux/repo/UPDATE_FAILED';
export const SAVE_UPDATE_REPOSITORY = 'instarux/repo/SAVE_UPDATE_REPOSITORY';

type Primitive = string | boolean | number;
type NotPrimitive = Object | any[];

type NamespaceState = {
	data: Primitive | NotPrimitive;
	error: boolean;
	loading: boolean;
	success: boolean;
	trace: null | string;
};

export const repoInitialState: { [key: string]: NamespaceState } = {};

export const createNamespaceState = (data: Primitive | NotPrimitive = []) => ({
	data,
	error: false,
	loading: false,
	success: false,
	trace: null,
});

export interface InitAction {
	type: string;
	options: {
		namespace: string;
		initialState?: any;
	};
}
export interface SuccessAction {
	type: string;
	namespace: string;
	payload: any;
}

export interface UpdateAction {
	type: string;
	namespace: string;
	newValue: any;
}

export interface ErrorAction {
	type: string;
	namespace: string;
	message: string | object;
}

export interface ClearAction {
	type: string;
	namespace: string;
}

type ActionType = InitAction | SuccessAction | UpdateAction | ErrorAction;

export default function reducer(state = repoInitialState, action: ActionType) {
	switch (action.type) {
		case FETCH_INIT:
		case FETCH_LATEST: {
			const {
				options: { namespace, initialState },
			} = action as InitAction;
			return {
				...state,
				[namespace]: {
					...createNamespaceState(initialState),
					loading: true,
				},
			};
		}
		case FETCH_CLEAR: {
			const newState = { ...state };
			const { namespace } = action as ClearAction;
			delete newState[namespace];
			return newState;
		}
		case FETCH_SUCCESS: {
			const { namespace, payload } = action as SuccessAction;
			return {
				...state,
				[namespace]: {
					...createNamespaceState(),
					data: payload,
					loading: false,
					success: true,
					error: false,
				},
			};
		}
		case FETCH_ERROR: {
			const { namespace, message } = action as ErrorAction;
			return {
				...state,
				[namespace]: {
					loading: false,
					success: false,
					error: true,
					trace: message,
				},
			};
		}
		case SAVE_UPDATE_REPOSITORY: {
			const { namespace, newValue } = action as UpdateAction;
			return {
				...state,
				[namespace]: newValue,
			};
		}
		default:
			return state;
	}
}

export interface fetchOptions {
	url: string;
	namespace: string;
	config?: AxiosRequestConfig;
	successCb?: Function;
	errorCb?: Function;
	autoClear?: boolean;
	selector?: (state: any, ...args: any[]) => any; // for formatting urls based on redux store
	external?: boolean;
	initialState?: Primitive | NotPrimitive;
}

export function fetchInit(options: fetchOptions) {
	return {
		type: FETCH_INIT,
		options,
	};
}

export function fetchLatest(options: fetchOptions) {
	return {
		type: FETCH_LATEST,
		options,
	};
}

export function fetchClear(namespace: string) {
	return {
		type: FETCH_CLEAR,
		namespace,
	};
}

interface UpdateRepoOptions {
	namespace: string;
	compute: Function;
}

export function updateRepository(options: UpdateRepoOptions) {
	return {
		type: UPDATE_REPOSITORY,
		options,
	};
}

export const repositorySelector = (state: any) => state.repository;

export const getNamespace = (namespace: string) => {
	return createSelector(repositorySelector, repo => {
		if (!repo[namespace]) return {};
		return repo[namespace];
	});
};

export const getData = (namespace: string) => {
	return createSelector(repositorySelector, repo => {
		if (!repo[namespace]) return null;
		return repo[namespace].data;
	});
};
