# Redux As Repo

This library provides utility functions to deal with redux without the boilerplate.

# Installation

```sh
npm i instarux
#or with yarn
yarn add instarux
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
import { repoSaga } from 'redux-as-repo';

// in your rootSaga, add the repoSaga

export default function* rootSaga() {
	yield all([fork(repoSaga)]);
}
```

## Common Action Creators

a `repository` slice in redux store handled by common action creators to store data.

```javascript
fetchInit(({ url, namespace: 'projects' }: fetchOptions));

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
	initialState?: Primitive | NotPrimitive;
}
```

1. dispatch action of type : instarux/repo/FETCH_INIT
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

import { getData } from 'redux-as-repo';

const dataSelector = getData(namespace);

// YourComponent/index.tsx
const data = useSelector(dataSelector);
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
