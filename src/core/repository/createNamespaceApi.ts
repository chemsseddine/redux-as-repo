import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AxiosRequestConfig } from 'axios';
import { fetchInit, fetchNewInit, fetchLatest, fetchFirst } from '.';
import { NamespaceState } from './types';
import useNamespace from '../../hooks/useNamespace';

export enum FetchEffect {
	New = 'new',
	First = 'first',
	Latest = 'latest',
	Init = 'init',
}
function pascalisize(str: string) {
	return str
		.replace(new RegExp(/[-_]+/, 'g'), ' ')
		.replace(new RegExp(/[^\w\s]/, 'g'), '')
		.replace(
			new RegExp(/\s+(.)(\w*)/, 'g'),
			($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
		)
		.replace(new RegExp(/\w/), s => s.toUpperCase());
}

interface HookFetchOptions {
	url: string;
	config: AxiosRequestConfig;
}

interface Hook {
	[key: string]: {
		query: (...args: any[]) => string | HookFetchOptions;
		effect?: `${FetchEffect}`;
		fetchOnMount?: boolean;
	};
}

export function chooseEffect(effect?: string) {
	switch (effect) {
		case FetchEffect.Latest:
			return fetchLatest;
		case FetchEffect.New:
			return fetchNewInit;
		case FetchEffect.First:
			return fetchFirst;
		case FetchEffect.Init:
		default:
			return fetchInit;
	}
}

interface HookResult extends NamespaceState {
	namespace: string;
	refetch: (...args: any[]) => void;
}

type ReturnedObject<Type> = {
	[Property in keyof Type as `use${Capitalize<string & Property>}`]: (
		...args: any[]
	) => HookResult;
};

interface CreateOptions<T> {
	namespace: string;
	queries: T;
}

interface HookOptions {
	autoClear?: boolean;
	deps: any[];
	onSuccess: (data: NamespaceState) => any;
}

export default function createNamespaceApi<T extends Hook>({
	queries,
	namespace,
}: CreateOptions<T>): ReturnedObject<T> {
	const methods = Object.keys(queries).map(method => ({
		hookName: `use${pascalisize(method)}`,
		method,
	}));

	const hooksDefs = {} as ReturnedObject<T>;

	methods.forEach(({ method, hookName }) => {
		const methodNamespace = `${namespace}_${method}`;
		const { effect, fetchOnMount } = queries[method];
		const queryArgsLength = queries[method].query.length;

		const fetchEffect = chooseEffect(effect);

		hooksDefs[hookName as keyof ReturnedObject<T>] = (
			...args: any[]
		): HookResult => {
			const queryArgs = args.slice(0, queryArgsLength);
			const { autoClear, onSuccess, deps } =
				args[queryArgsLength] || ({} as HookOptions);
			const dispatch = useDispatch();
			const namespaceState = useNamespace({
				namespace: methodNamespace,
				autoClear,
				onSuccess,
			});

			const refetch = useCallback((...innerData: any[]) => {
				const innerArgs = innerData.length > 0 ? innerData : queryArgs;
				if (queryArgsLength > innerArgs.length) {
					throw new Error(
						`Invalid Arguments , ${hookName} expected ${queryArgsLength} required arguments , received ${innerArgs.length}`
					);
				}
				const result = queries[method].query(...innerArgs);
				const configuration =
					typeof result === 'string'
						? { namespace: methodNamespace, url: result }
						: { ...result, namespace: methodNamespace };
				dispatch(fetchEffect(configuration));
			}, []);

			useEffect(() => {
				if (fetchOnMount && !deps) {
					refetch(...queryArgs);
				}
			}, []);

			useEffect(() => {
				if (deps) {
					refetch(...queryArgs);
				}
			}, deps);

			return { ...namespaceState, refetch, namespace: methodNamespace };
		};
	});

	return hooksDefs;
}
