import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects';
import axios, { AxiosRequestConfig } from 'axios';
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

export function service(options: AxiosRequestConfig) {
	return axios(options);
}

export function* fetchDataSaga(action: {
	options: FetchOptions;
	type: string;
}): Generator<any, any, any> {
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
		const response = yield call(service, {
			method,
			url: formattedUrl,
			data,
			params,
		});
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
		compute: Function;
		namespace: string;
	};
};

function* updateRepoSaga(action: UpdateAction): Generator<any, any, any> {
	try {
		const { compute, namespace } = action.options;
		const namespaceData = yield select(getNamespace(namespace));
		const newValue = compute(namespaceData);
		yield put({ type: SAVE_UPDATE_REPOSITORY, namespace, newValue });
	} catch (error) {
		yield put({ type: UPDATE_FAILED, message: error });
	}
}

export default function* repoSaga() {
	yield takeEvery(FETCH_INIT, fetchDataSaga);
	yield takeLatest(FETCH_LATEST, fetchDataSaga);
	yield takeLatest(UPDATE_REPOSITORY, updateRepoSaga);
}
