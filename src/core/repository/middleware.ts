import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects';
import { AxiosInstance } from 'axios';
import { FetchOptions } from './types';
import {
	FETCH_ERROR,
	FETCH_INIT,
	FETCH_SUCCESS,
	FETCH_LATEST,
	fetchClear,
	UPDATE_REPOSITORY,
	getNamespace,
	SAVE_UPDATE_REPOSITORY,
	UPDATE_FAILED,
} from '.';
const format = require('string-template');

type FetchAction = {
	options: FetchOptions;
	type: string;
};
export function* fetchDataSaga(
	action: FetchAction,
	axiosInstance: AxiosInstance
): Generator<any, any, any> {
	const {
		namespace,
		url,
		config: { method = 'get', data = null, params = null } = {},
		successCb,
		errorCb,
		autoClear,
		selector,
	} = action.options;

	let selectedState: { [key: string]: string } = {};
	if (selector) {
		selectedState = yield select(selector);
	}
	const formattedUrl = selector ? format(url, selectedState) : url;
	try {
		const service = () =>
			axiosInstance({
				method,
				url: formattedUrl,
				data,
				params,
			});
		const response = yield call(service);
		yield put({
			type: FETCH_SUCCESS,
			payload: response.data,
			namespace,
		});
		if (successCb) {
			yield put(successCb(response.data));
		}
		if (autoClear) {
			yield put(fetchClear(namespace));
		}
	} catch (e) {
		if (errorCb) {
			yield put(errorCb(e));
		}
		yield put({
			type: FETCH_ERROR,
			message: e.message,
			namespace,
		});
	}
}

type UpdateAction = {
	type: string;
	options: {
		compute: (state: any) => any;
		namespace: string;
	};
};

export function* updateRepoSaga(
	action: UpdateAction
): Generator<any, any, any> {
	try {
		const { compute, namespace } = action.options;
		const namespaceData = yield select(getNamespace(namespace));
		const newValue = compute(namespaceData);
		yield put({ type: SAVE_UPDATE_REPOSITORY, namespace, newValue });
	} catch (error) {
		yield put({ type: UPDATE_FAILED, message: error });
	}
}

export default function* repoSaga(axiosInstance: AxiosInstance) {
	yield takeEvery(FETCH_INIT, (action: FetchAction) =>
		fetchDataSaga(action, axiosInstance)
	);
	yield takeLatest(FETCH_LATEST, (action: FetchAction) =>
		fetchDataSaga(action, axiosInstance)
	);
	yield takeLatest(UPDATE_REPOSITORY, updateRepoSaga);
}
