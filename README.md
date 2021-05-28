[![CI](https://github.com/chemsseddine/redux-as-repo/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/chemsseddine/redux-as-repo/actions/workflows/main.yml)
[![Publish](https://github.com/chemsseddine/redux-as-repo/actions/workflows/npm-publish.yml/badge.svg?branch=master)](https://github.com/chemsseddine/redux-as-repo/actions/workflows/npm-publish.yml)

# Redux As Repo

This library provides utility functions to deal with redux without the boilerplate.

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

`repository` slice in redux store handled by common action creators to store data.

| Property    | Type                 | required | Description                                                                                                                                                                                                                                          |
| ----------- | -------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`       | `string`             | Yes      | url                                                                                                                                                                                                                                                  |
| `namespace` | `string`             | Yes      | where to store the dara inside repository                                                                                                                                                                                                            |
| `config`    | `AxiosRequestConfig` |          | Axios config object (method, data, params)                                                                                                                                                                                                           |
| `successCb` | Action Creator       |          | Function that takes response data as an argument and returns an action `(data) => ({type:'SOME_ACTION', data}) `                                                                                                                                     |
| `errorCb`   | Action Creator       |          | same as successCb but will take error as callback argument                                                                                                                                                                                           |
| `autoClear` | `boolean`            |          | will clear the namespace after success                                                                                                                                                                                                               |
| `selector`  | `Function`           |          | A selector that returns an object with the desired to be formatted keys: `state => ( { projectId: state.projectId })` <br /> `const url = '/randomLink/{projectId}'` <br> projectId will be replaced therefore by the value coming from the selector |

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

`fetchLatest` as the name suggests will ignore all previous api responses and handle the last response.

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

`fetchClear(namespace)` will clear data stored for `repository[namespace]`

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

| Property    | Type       | required          | Description                                   |
| ----------- | ---------- | ----------------- | --------------------------------------------- |
| `autoClear` | `boolean`  | default : `false` | clear namespace on component cleanup          |
| `namespace` | `string`   | Yes               | where namespace is saved                      |
| `onSuccess` | `callback` | No                | will be executed if namespace.success is true |
