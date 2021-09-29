import repoReducer from './core/repository';
import useNamespace from './hooks/useNamespace';
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

export { repoReducer, createRepoSaga, useNamespace };
