import { AxiosInstance } from 'axios';
import repoSaga from './core/repository/middleware';
import repoReducer, {
	getNamespace,
	fetchInit,
	fetchClear,
	fetchLatest,
	updateRepository,
	getData,
	getLoadingState,
} from './core/repository';
import useNamespace from './hooks/useNamespace';

function createRepoSaga(axiosInstance: AxiosInstance) {
	return repoSaga(axiosInstance);
}

export {
	repoSaga,
	repoReducer,
	createRepoSaga,
	getNamespace,
	useNamespace,
	fetchInit,
	fetchClear,
	fetchLatest,
	updateRepository,
	getData,
	getLoadingState,
};
