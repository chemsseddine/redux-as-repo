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
import axios from 'axios';
import { all, fork } from 'react-sagas/effects';
import { createRepoSaga } from 'redux-as-repo';

axios.create({
	baseURL: '...',
	// other configs
});

const repoSaga = createRepoSaga(axiosInstance);

// in your rootSaga, add the repoSaga

export default function* rootSaga() {
	yield all([fork(repoSaga)]);
}
```

## Common Action Creators

a `repository` slice in redux store handled by common action creators to store data.

```javascript
export function fetchProjects() {
	fetchInit(({
	 	url,
		namespace: 'projects'
	}));
}

//options
export interface fetchOptions {
	url: string;
	namespace: string;
	config?: AxiosRequestConfig;
	successCb?: Function;
	errorCb?: Function;
	autoClear?: boolean;
	selector?: (state: any, ...args: any[]) => any; // for formatting urls based on redux store
	external?: boolean;
	initialState?: any;
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

```js
import { useNamespace } from 'redux-as-repo';

const { data, error, loading } = useNamespace({
	namespace: 'PROJECTS',
	onSuccess: callback,
	autoClear: false,
});
```
