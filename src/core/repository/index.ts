import { createSelector } from 'reselect';
import {
	NamespaceState,
	ActionType,
	ErrorAction,
	UpdateAction,
	ClearAction,
	InitAction,
	SuccessAction,
	FetchOptions,
	UpdateRepoOptions,
} from './types';

export const FETCH_INIT = '@redux-as-repo/FETCH_INIT';
export const FETCH_SUCCESS = '@redux-as-repo/FETCH_SUCCESS';
export const FETCH_ERROR = '@redux-as-repo/FETCH_ERROR';
export const FETCH_LATEST = '@redux-as-repo/FETCH_LATEST';
export const FETCH_CLEAR = '@redux-as-repo/FETCH_CLEAR';
export const UPDATE_REPOSITORY = '@redux-as-repo/UPDATE_REPOSITORY';
export const UPDATE_FAILED = '@redux-as-repo/UPDATE_FAILED';
export const SAVE_UPDATE_REPOSITORY =
	'@redux-as-repo/repo/SAVE_UPDATE_REPOSITORY';

export const repoInitialState: { [key: string]: NamespaceState } = {};

export const createNamespaceState = (data: any = []): NamespaceState => ({
	data,
	error: false,
	loading: false,
	success: false,
	trace: null,
});

export default function reducer(state = repoInitialState, action: ActionType) {
	switch (action.type) {
		case FETCH_INIT:
		case FETCH_LATEST: {
			const {
				options: { namespace, initialState },
			} = action as InitAction;
			if (!state[namespace]) {
				return {
					...state,
					[namespace]: {
						...createNamespaceState(initialState),
						loading: true,
					},
				};
			}
			return {
				...state,
				[namespace]: {
					...state[namespace],
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
					...state[namespace],
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

export function fetchInit(options: FetchOptions) {
	return {
		type: FETCH_INIT,
		options,
	};
}

export function fetchLatest(options: FetchOptions) {
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

export function updateRepository(options: UpdateRepoOptions) {
	return {
		type: UPDATE_REPOSITORY,
		options,
	};
}

export const repositorySelector = (state: any): { [key: string]: any } =>
	state.repository;

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

export const getLoadingState = (namespace: string) => {
	return createSelector(repositorySelector, repo => {
		if (!repo[namespace]) return false;
		return repo[namespace].loading;
	});
};
