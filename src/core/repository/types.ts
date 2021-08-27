import { AxiosRequestConfig } from 'axios';

export type NamespaceState = {
	data: any;
	error: boolean;
	loading: boolean;
	success: boolean;
	trace: null | string;
};

export interface InitAction {
	type: string;
	options: {
		namespace: string;
		initialState?: any;
	};
}
export interface SuccessAction {
	type: string;
	namespace: string;
	payload: any;
}

export interface UpdateAction {
	type: string;
	namespace: string;
	newValue: any;
}

export interface ErrorAction {
	type: string;
	namespace: string;
	message: string | object;
}

export interface ClearAction {
	type: string;
	namespace: string;
}

export type ActionType =
	| InitAction
	| SuccessAction
	| UpdateAction
	| ErrorAction
	| ClearAction;

export interface FetchOptions {
	url: string;
	namespace: string;
	config?: AxiosRequestConfig;
	successCb?: Function;
	errorCb?: Function;
	autoClear?: boolean;
	selector?: (state: any, ...args: any[]) => { [key: string]: string };
	initialState?: any;
	disableResponseHandler?: any;
}

export interface UpdateRepoOptions {
	namespace: string;
	compute: Function;
}
