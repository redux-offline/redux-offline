# Use with [Next.js](https://github.com/zeit/next.js)

## Introduction

The recommended Redux wrapper, (next-redux-wrapper)[https://github.com/kirill-konshin/next-redux-wrapper], does not work with (Redux Persist)[https://github.com/rt2zz/redux-persist]. At least not by the default.

This is because both libraries aim to replace the state entirely, so unless merge the two state manually when Redux Persist rehydrates the state, this is not going to work.

A more general solution is to import the state from the server as a series of actions and replay those on top of the rehydrated state. This is what (next-redux-replay)[https://github.com/wacii/next-redux-replay] does.

## `makeStore()`

To use _next-redux-replay_, you have to define `makeStore()` and `initStore()`. `makeStore()` constructs the store with the provided action recording middleware and then replays the provided actions on the store. With _Redux Offline_ there are two more concerns.

First, the store is not going to be truly ready until the state has been rehydrated, so wait until that happens before you replay the actions from the server.

Second, because _Next.js_ controls the rendering of your component, you cannot wait until after rehydration to render your app; instead display a loading state, then trigger the rendering of the actual content once the server actions have been replayed.

> With care, you can display your app immediately, but because the server will not know what a particular client has saved to storage, the initial render will generally not be accurate. The (with-redux-offline example)[https://github.com/wacii/next-redux-replay/tree/master/examples/with-redux-offline] demonstrates this.

```js
const makeStore = (actions, middleware) => {
  const config = {
    ...defaultConfig,
    persistCallback() {
      actions.forEach(action => store.dispatch(action));
      // store.dispatch({ type: "PAGE_IS_READY_TO_BE_SHOWN" });
    }
  };
  const store = createStore(
    myReducer,
    compose(offline(config), applyMiddleware(middleware))
  );
  return store;
}
```

## `initStore()`

`initStore()` is where you request data for the page render. This serves the same purpose as `getInitialProps()`, but `initStore()` exposes `store`. If you make requests with _Redux Offline_ you will probably want to wait for those requests to finish. To accomplish this wait for `offline.outbox` to empty.

> There is also an experimental feature that you can opt into that returns promises from dispatch. While this is certainly a more straight-forward solution, the feature is not finalized, so use your discretion.

```js
const initStore = store => {
  store.dispatch(someOfflineAction());

  return new Promise(resolve => {
    store.subscribe(state => {
      if (state.offline.outbox.length === 0) {
        resolve(null);
      }
    });
  });
};
```

## `withRedux()

With both these functions defined, use the `withRedux()` HOC to decorate your Page Component. `next-redux-replay` does not connect the Page Component, so you will still have to connect any components that need to access the state.

```js
const MyPage = () => null;
export default withRedux(makeStore, initStore)(MyPage);
```
