import repoReducer from './core/repository';
import useNamespace from './hooks/useNamespace';
import createNamespaceApi, {
	FetchEffect,
} from './core/repository/createNamespaceApi';
import createRepoSaga from './core/repository/middleware';

export {
	getNamespace,
	fetchInit,
	fetchClear,
	fetchLatest,
	fetchNewInit,
	fetchFirst,
	updateRepository,
	getData,
	getLoadingState,
} from './core/repository';

export {
	repoReducer,
	createRepoSaga,
	useNamespace,
	createNamespaceApi,
	FetchEffect,
};
