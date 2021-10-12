[![CI](https://github.com/chemsseddine/redux-as-repo/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/chemsseddine/redux-as-repo/actions/workflows/main.yml)
[![Publish](https://github.com/chemsseddine/redux-as-repo/actions/workflows/npm-publish.yml/badge.svg?branch=master)](https://github.com/chemsseddine/redux-as-repo/actions/workflows/npm-publish.yml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# Redux As Repo

This library provides utility functions to deal with redux without the boilerplate.

Usage Examples on [CodeSandbox](https://codesandbox.io/s/redux-as-repo-kij54)

# Installation

```sh
npm i redux-as-repo
# using yarn
yarn add redux-as-repo
```

# Usage

```js
import { repoReducer } from 'redux-as-repo';

// in your rootReducer, add the repoReducer

combineReducers({
	repository: repoReducer,
});

// or if you are using a reducer registry

reducerRegistry.register('repository', repoReducer);
```

```js
import { all, fork } from 'react-sagas/effects';
import { createRepoSaga } from 'redux-as-repo';
import { axiosInstance } from 'your/axios/instance';

// in your rootSaga, create repoSaga


const handleResponse = (axiosData) => {
	if (...){
		return ...
	}
	return ...
}

const repoSaga = createRepoSaga(axiosInstance, handleResponse);

export default function* rootSaga() {
	yield all([fork(repoSaga)]);
}
```

`createRepoSaga` takes 2 arguments:

1. `axiosInstance` which is required
2. response handler: `optional` (if your backend has fixed format to return data, you can create a handler that returns a portion of response and store it inside the key `data`)

```json
{
	"result": [],
	"status": "success",
	"errorMessage": "...",
	"errorCode": "..."
}
```

if you need just `result`, define a response handler and pass it to `createRepoSaga`

```javascript
const handleResponse = data => {
	if (status === 'success') {
		return data.result;
	} else throw new Error(data.errorMessage);
};
```

Throwing an error will cause a `FETCH_ERROR` action to be dispatched

## Common Action Creators

| actionCreator      | args            | saga effect   | Description                                                                                       |
| ------------------ | --------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| `fetchInit`        | `FetchOptions`  | `takeEvery`   | Every action is handled by the repo reducer                                                       |
| `fetchLatest`      | `FetchOptions`  | `takeLatest`  | Only last resolved value will be taken into consideration by the repo reducer                     |
| `fetchFirst`       | `FetchOptions`  | `takeLeading` | it blocks all upcoming actions `FETCH_FIRST` until the previous action is handled by repo reducer |
| `fetchNewInit`     | `FetchOptions`  | `takeEvery`   | same as `fetchInit` but creates a new namespace template for each request                         |
| `fetchClear`       | `string`        | None          | No Saga effect, will clear the namespace in question                                              |
| `updateRepository` | `UpdateOptions` | `takeEvery`   | update/create new namespace with the resulting of `compute` method                                |

## `FetchOptions`

`repository` slice in redux store handled by common action creators to store data.

| Property              | Type                 | required | Description                                                                                                                                                                                                                                          |
| --------------------- | -------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                 | `string`             | Yes      | url                                                                                                                                                                                                                                                  |
| `namespace`           | `string`             | Yes      | where to store the dara inside repository                                                                                                                                                                                                            |
| `config`              | `AxiosRequestConfig` |          | Axios config object (method, data, params)                                                                                                                                                                                                           |
| `successCb`           | Action Creator       |          | Function that takes response data as an argument and returns an action `(data) => ({type:'SOME_ACTION', data}) `                                                                                                                                     |
| `errorCb`             | Action Creator       |          | same as successCb but will take error as callback argument                                                                                                                                                                                           |
| `autoClear`           | `boolean`            |          | will clear the namespace after success                                                                                                                                                                                                               |
| `skipResponseHandler` | `boolean`            |          | if you are using response handler that you want to disable for this specific request , pass this option as `true`                                                                                                                                    |
| `selector`            | `Function`           |          | A selector that returns an object with the desired to be formatted keys: `state => ( { projectId: state.projectId })` <br /> `const url = '/randomLink/{projectId}'` <br> projectId will be replaced therefore by the value coming from the selector |

```javascript
export function fetchProjects() {
	return fetchInit(({
	 	url,
		namespace: 'projects'
	}));
}


//in your YourComponent
import { useDispatch } from 'react-redux';
import { fetchProjects } from 'path/of/your_redux_actions';

const MyComponent = () => {
	const dispatch = useDispatch()

	useEffect(() => {
	  dispatch(fetchProjects())
	},[])

	return (...)
}
```

1. dispatch action of type : @repo-as-reducer/FETCH_INIT
2. an xhr call to url with options provided
3. response data will be stored inside repository.projects

data is stored in this format

```json
    {
        repository: {
            projects: {
                data: [...],
                error: false,
                loading: false,
                success: true,
                trace: null,
            }
        }
    }
```

### `updateRepository`

Use this common action creator for creating a new namespace or updating an existing namespace.

`UpdateOptions`

```
UpdateOptions {
	namespace: string;
	compute: (namespaceState: undefined | NamespaceState) => NewNamespaceState;
}
```

Usage

```javascript
function updateProject(newValue) {
	return updateRepository({
		namespace: 'projects',
		compute: oldNamespaceState => ({
			...oldNamespaceState,
			key: newValue,
		}),
	});
}
```

## Selectors

to get stored data by namespace use `getData(namespace)`
this will create a memoized selector.

```js
// store/YourComponent/index.ts

import { getData, getLoadingState } from 'redux-as-repo';

const dataSelector = getData(namespace);
const loadingStateSelector = getLoadingState(namespace);

// YourComponent/index.tsx
const data = useSelector(dataSelector);
const isLoading = useSelector(loadingStateSelector);
```

### useNamespace as a custom hook

To get namespace data without using selectors, a custom hook is there for you

```js
import { useNamespace } from 'redux-as-repo';

const { data, error, loading } = useNamespace({
	namespace: 'PROJECTS',
	onSuccess: callback,
	autoClear: true,
});
```

| Property    | Type       | required          | Description                                                                   |
| ----------- | ---------- | ----------------- | ----------------------------------------------------------------------------- |
| `autoClear` | `boolean`  | default : `false` | clear namespace on component cleanup                                          |
| `namespace` | `string`   | Yes               | where namespace is saved                                                      |
| `onSuccess` | `callback` | No                | will be executed if namespace.success is true, data is passed to the callback |

# Query Hooks Generation

To generate hooks ready to be used in the component

`createNamespaceApi`

| Property    | Type     | required | Description                                                  |
| ----------- | -------- | -------- | ------------------------------------------------------------ |
| `namespace` | `string` | Yes      | base namespace where to store data `{namespace}_{queryName}` |
| `queries`   | `Hook`   | Yes      | object that holds all queries methods                        |

```typescript
interface Hook {
	[key: string]: {
		query: (...args: any[]) => string | HookFetchOptions;
		effect?: `${FetchEffect}`;
		fetchOnMount?: boolean;
	};
}

interface HookFetchOptions {
	url: string;
	config: AxiosRequestConfig;
}

export enum FetchEffect {
	New = 'new',
	First = 'first',
	Latest = 'latest',
	Init = 'init',
}
```

### Generated Hook ReturnType

```typescript
interface HookResult extends NamespaceState {
	namespace: string;
	refetch: (...args: any[]) => void;
}

export type NamespaceState = {
	data: any;
	error: boolean;
	loading: boolean;
	success: boolean;
	trace: null | string;
	fullError: null | any;
};
```

## Usage

```js
import { createNamespaceApi, FetchEffect } from 'redux-as-repo';

const hooks = createNamespaceApi({
	namespace: 'todos',
	queries: {
		getTodo: {
			query: () => 'todos',
			effect: FetchEffect.First,
			fetchOnMount: true,
		},
		getTodoById: {
			query: id => `todos/${id}`,
		},
		addTodo: {
			query: data => ({
				url: '/todos',
				config: {
					method: 'post',
					data,
				},
			}),
		},
	},
});

export const { useGetTodo, useGetTodoById, useAddTodo } = hooks;

// Component.tsx
...
const [state, setState] = useState(false);
const [id, setId] = useState(1);

const { data, loading, error, refetch } = useGetTodo({
	autoClear: true,
	onSuccess: console.log,
	deps: [state],
});

const { refetch: getTodoById } = useGetTodoById(id, {
	deps: [id, state],
});

const { refetch: addTodo } = useAddTodo({ key: 'value' });
```

```typescript
interface HookOptions {
	autoClear?: boolean;
	deps: any[];
	onSuccess: (data: NamespaceState) => any;
}
```
