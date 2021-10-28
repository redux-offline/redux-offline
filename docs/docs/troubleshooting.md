---
sidebar_position: 5
title: Troubleshooting
---

## Offline queue doesn't trigger on network status change
If you have actions in your redux-offline queue, all of them should be dispatched as soon as your app goes online again.

If you experience the queue *doesn't* execute, then this guide will explain how to fix it, and why it works.

### TL;DR - The fix
For you in a hurry; The error is caused by your redux store getting configured incorrectly, when you you use the `createOffline` function instead of using the default setup.

When composing your store's enhances, the offlineEnhancer ***MUST*** come first.

**Example of a correctly configured store**
```javascript
// redux-configuration.js

const reduxOfflineConfiguration = { /*config stuff*/ };
const initialState = {};
const offlineEnhancer = createOffline(reduxOfflineConfiguration);
function rootReducer() {
  // Root reducer code
}

const store = createStore(
    offlineEnhancer.enhanceReducer(rootReducer),
    initialState,
    compose(
        offlineEnhancer.enhanceStore, // <-- The offline enhancer comes first. Your queue will execute just fine :)
        applyMiddleware(offlineEnhancer.middleware)
    )
);
```

### Why
The reason why the store configuration needs to be as described above is very well explained by github user @j8seangel in this issue: [Fix offline not starting after rehydrate](https://github.com/forest-watcher/forest-watcher/pull/303) (He's also the original author of above fix). I'll quote his answer here:

>Order matters, swapping two words could fix a critical bug 🎉
>
>The offline middleware wasn't aware of the outbox actions after rehydrate until another action was dispatched, so when the app starts and it doesn't dispatch any other action the offline wouldn't start and the actions would remain there forever.
>
>Now the middleware is applied first and all of the actions go through it, including the rehydrate one.
>
>Reference: https://redux.js.org/api-reference/compose
>Key: `Composes functions from right to left.`

Also, @sorodrigo explains the problem AND solution quite exact [here](https://github.com/redux-offline/redux-offline/pull/229)
> The redux-offline peeks the offlineAction to process everytime an action goes through the middleware chain. This works fine for actions dispatched in the same session. However when the store gets rehydrated if there's actions on the outbox, these will remain there until an action is dispatched. This is because, the offline middleware is registered after the persist has been configured so the PERSIST_REHYDRATE action doesn't trigger the offline process.
>
> The solution is to simply apply middleware before enhancing the store.

If this doesn't fix your queue not executing, open an issue :)

Happy programming!
