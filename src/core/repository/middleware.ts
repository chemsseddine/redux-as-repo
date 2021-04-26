import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects';
import Api from 'axios';
import {
	FETCH_ERROR,
	FETCH_INIT,
	FETCH_SUCCESS,
	FETCH_LATEST,
	fetchOptions,
	fetchClear,
	UPDATE_REPOSITORY,
	getNamespace,
	SAVE_UPDATE_REPOSITORY,
	UPDATE_FAILED,
} from '.';
const format = require('string-template');

declare const window: { API_URL: string };

function* fetchData(action: {
	options: fetchOptions;
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
		external,
	} = action.options;

	let selectedState;
	if (selector) {
		selectedState = yield select(selector) as any;
	}
	const formattedUrl = selector ? format(url, selectedState) : url;
	const requestedUrl = external
		? formattedUrl
		: `${window.API_URL}${formattedUrl}`;
	const callFunction = () => Api({ method, url: requestedUrl, data, params });
	try {
		const response = yield call(callFunction);
		const result = response.data;
		yield put({
			type: FETCH_SUCCESS,
			payload: result,
			namespace,
		});
		if (successCb) {
			yield put(successCb(result));
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
	yield takeEvery(FETCH_INIT, fetchData);
	yield takeLatest(FETCH_LATEST, fetchData);
	yield takeLatest(UPDATE_REPOSITORY, updateRepoSaga);
}
