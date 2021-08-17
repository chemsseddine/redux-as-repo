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
	const { success, data, ...rest } = useSelector(
		getNamespace(namespace),
		isEqual
	);

	useEffect(() => {
		if (success && onSuccess) {
			onSuccess(data);
		}
	}, [success, onSuccess]);

	useEffect(() => {
		return () => {
			if (autoClear) {
				dispatch(fetchClear(namespace));
			}
		};
	}, [autoClear, dispatch, namespace]);

	return { success, data, ...rest };
}
