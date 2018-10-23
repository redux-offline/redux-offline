# Offline queue doesn't trigger on network status change

### TL;DR version
You compose functions in the wrong order in your redux config. Change the order of the functions in `composeEnhancers()`:

Go from
```typescript
composeEnhancers(
    applyMiddleware(offlineEnhancer.middleware as any, epicMiddleware),
    offlineEnhancer.enhanceStore
)
```
to
```typescript
composeEnhancers(
    offlineEnhancer.enhanceStore,
    applyMiddleware(offlineEnhancer.middleware as any, epicMiddleware)
)
```

The offline queue will now dispatch immediatly when going online.

### Full story
Sometimes you can experience the offline queue not triggering immediatly when coming back online. However it does trigger, as soon you dispatch some other redux action.

This problem is caused by your redux configuration not being set up 100% correctly. The good news is the fix is very simple.

Below is a working redux configuration (but!)

```typescript
export const configureRedux = (ngRedux: NgRedux<IAppState>, ngReduxRouter: NgReduxRouter, reduxOfflineConfiguration: ReduxOfflineConfiguration, rootEpics: RootEpics) => {
    const initialState: DeepPartial<any> = {};
    const offlineEnhancer = createOffline(reduxOfflineConfiguration);
    const epicMiddleware = createEpicMiddleware();

    const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store: Store<IAppState> = createStore(
        offlineEnhancer.enhanceReducer(rootReducer),
        initialState,
        composeEnhancers(
            applyMiddleware(offlineEnhancer.middleware as any, epicMiddleware),
            offlineEnhancer.enhanceStore
        )
    );

    ngRedux.provideStore(store);

    epicMiddleware.run(rootEpics.getEpics());

    // Enable syncing of Angular router state with our Redux store.
    if (ngReduxRouter) {
        ngReduxRouter.initialize();
    }
};
```

This configuration will *NOT* have its offline queue dispatched immediatly when coming online. The reason is the order the functions get composed. The faulty order can be seen below.

```typescript
composeEnhancers(
    applyMiddleware(offlineEnhancer.middleware as any, epicMiddleware),
    offlineEnhancer.enhanceStore
)
```

As correctly noted by @j8seangel on [this issue](https://github.com/Vizzuality/forest-watcher/pull/303), the order in which functions are composed matters.

Also, @sorodrigo explains the problem AND solution quite exact [here](https://github.com/redux-offline/redux-offline/pull/229)
> The redux-offline peeks the offlineAction to process everytime an action goes through the middleware chain. This works fine for actions dispatched in the same session. However when the store gets rehydrated if there's actions on the outbox, these will remain there until an action is dispatched. This is because, the offline middleware is registered after the persist has been configured so the PERSIST_REHYDRATE action doesn't trigger the offline process.
>
> The solution is to simply apply middleware before enhancing the store.


The solution, then, is to simply change the order of the functions in `composeEnhancers()`. The below example *WILL* have its offline queue dispatched immediatly.

```typescript
export const configureRedux = (ngRedux: NgRedux<IAppState>, ngReduxRouter: NgReduxRouter, reduxOfflineConfiguration: ReduxOfflineConfiguration, rootEpics: RootEpics) => {
    const initialState: DeepPartial<any> = {};
    const offlineEnhancer = createOffline(reduxOfflineConfiguration);
    const epicMiddleware = createEpicMiddleware();

    const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store: Store<IAppState> = createStore(
        offlineEnhancer.enhanceReducer(rootReducer),
        initialState,
        composeEnhancers(
            offlineEnhancer.enhanceStore,
            applyMiddleware(offlineEnhancer.middleware as any, epicMiddleware)
        )
    );

    ngRedux.provideStore(store);

    epicMiddleware.run(rootEpics.getEpics());

    // Enable syncing of Angular router state with our Redux store.
    if (ngReduxRouter) {
        ngReduxRouter.initialize();
    }
};
```

As you can see, the only change made is in the `composeEnhancers()`

```typescript
composeEnhancers(
    offlineEnhancer.enhanceStore,
    applyMiddleware(offlineEnhancer.middleware as any, epicMiddleware)
)
```

### Related material
https://github.com/Vizzuality/forest-watcher/pull/303 \
https://github.com/redux-offline/redux-offline/pull/229 \
https://github.com/redux-offline/redux-offline/issues/165 