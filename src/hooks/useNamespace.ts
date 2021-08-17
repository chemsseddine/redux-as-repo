import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchClear, getNamespace } from '../core/repository';
const isEqual = require('lodash.isequal');

interface Options {
	namespace: string;
	onSuccess?: Function;
	autoClear?: boolean;
}

export default function useNamespace({
	namespace,
	onSuccess,
	autoClear = false,
}: Options) {
	const dispatch = useDispatch();
	const namespaceData = useSelector(getNamespace(namespace), isEqual);

	useEffect(() => {
		if (namespaceData?.success && onSuccess) {
			console.info('executing success callback in useNamespace');
			onSuccess(namespaceData);
		}
	}, [namespaceData?.success, onSuccess]);

	useEffect(() => {
		return () => {
			if (autoClear) {
				dispatch(fetchClear(namespace));
			}
		};
	}, [autoClear, dispatch, namespace]);

	return namespaceData;
}
