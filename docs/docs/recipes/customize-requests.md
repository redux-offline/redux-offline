---
sidebar_position: 1
title: "Customize Requests"
---

## Configure how requests are made

### The effect reconciler

`config.effect` and `config.discard` together are responsible for executing a serialized request and resolving it to one of three outcomes. These outcomes and their resulting actions are success and commit, temporary failure and retry, and permanent failure and rollback.

The following code demonstrates roughly how these functions are used in the codebase.

```js
const offlineData = offlineAction.meta.offline;

config.effect(offlineData.effect)
  .then(response => {
    // dispatch offlineData.commit action
  })
  .catch(error => {
    if (config.discard(error)) {
      // dispatch offlineData.rollback action
    } else {
      // retry request after some delay
    }
  });
```

If you would like to change how Redux Offline processes requests, you should provide your own implementation for both `effect` and `discard`.

## Example: Using axios

Let's write `effect` and `discard` functions using the [axios](https://github.com/axios/axios) library.

The effect reconciler accepts an effect object describing the request, and the offline action associated with that request. Assuming the effect object is a valid axios config object, the implementation could be as simple as:

```js
const effect = (effect, _action) => axios(effect);
```

For the discard function, to duplicate the behavior of the default implementation, we will return true if the provided error represents a client error. So a status code of `4xx`.

```js
const discard = (error, _action, _retries) => {
  const { response } = error;
  return response && 400 <= response.status && response.status < 500;
}
```

> A production ready implementation would also consider errors triggered during creating the request. These are currently grouped with network and server errors which is incorrect. You should instead rethrow so as to not obscure the underlying error, which almost certainly represents a bug.

The following is a full example using axios to resolve requests.

```js
const effect = (effect, _action) => axios(effect);
const discard = (error, _action, _retries) => {
  const { request, response } = error;
  if (!request) throw error; // There was an error creating the request
  if (!response) return false; // There was no response
  return 400 <= response.status && response.status < 500;
};

const store = createStore(myReducer, offline({
  ...config,
  effect,
  discard
}));

store.dispatch({
  type: 'SOME_OFFLINE_ACTION',
  meta: {
    offline: {
      effect: { url: 'example.com' }
    }
  }
});
```

[Try it on CodeSandbox.](https://codesandbox.io/s/jp6zrj3pj5)

## Example: `async` discard

The discard function can return a promise. This can be useful if you need to make network requests in response to some failed request, such as refreshing access tokens on `401 Unauthorized`.

In the following example, when we receive a `401 Unauthorized` response, we call `refreshAccessToken()`, update _localStorage_, and then return `false` if we received a new access token.

Both the code checking for `status` on error and the code checking that `status` represents a client error is taken from the default implementation.

```js
const discard = async (error, _action, _retries) => {
  if (!status in error) return false;

  if (error.status === 401) {
    const newAccessToken = await refreshAccessToken();
    localStorage.set('accessToken', newAccessToken);
    return newAccessToken == null;
  }

  return 400 <= error.status && error.status < 500;
}
```
