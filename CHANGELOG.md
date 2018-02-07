<a name="2.3.1"></a>
# [2.3.1](https://github.com/redux-offline/redux-offline/releases/tag/v2.3.1) (2018-02-07)

### Bug Fixes

* Fixes default discard not detecting NetworkError correctly. (@jsslai in #185)
* Error object in JS_ERROR action was being overwritten with undefined, includes it as meta.error .
 (@jordoh in #152)

### Features

* New feature (EXPERIMENTAL & UNSTABLE): store.dispatch now returns a promise for offline actions. 
This allows 
chaining 
actions and 
callbacks with offline actions. Does not work after rehydration!
* Adds test for processing outbox when coming online.
* Improve docs in README (@wacii and @sorodrigo in #153, #160, #163, #176, #181)

<a name="2.2.1"></a>
## [2.2.1](https://github.com/redux-offline/redux-offline/releases/tag/v2.2.1) (2017-11-26)

### Bug Fixes

* Adds backwards compatibility for network status reducer (@sorodrigo in #147 )
* Removes unused variable persistor (@wacii in #139 )
* Includes polyfills (@wacii in #144 )

### Features

* Improves docs in README (@wacii in #138 )

<a name="2.2.0"></a>
## [2.2.0](https://github.com/redux-offline/redux-offline/releases/tag/v2.2.0) (2017-11-06)

### Bug Fixes

* Prevent outdated connectivity info from updating the online status. (@birgernass in #58 )
* Updated deprecated Net Info. (@kbrandwijk in #52 )
* Fix failing test. (@wacii in #51 )
* Fix payload/meta inconsistency in `README.MD`. (@elf-pavlik in #38 )
* Remove console statements. (@wacii in #34 )

### Features

* Allow to use promises in discard function. (@piranna in #53 )
* Add basic example (@wacii in #46 )
* Tests for default effector (@piranna in #43 )
* Immutable js root state (@fabriziomoscon and @Ashmalech in #42 )
* Support HMR (@wacii in #32 )
* Optional commit/rollback. (@sebasgarcep in #30 )
* Alternative API: Give user control over where the middleware is applied. (@wacii in #26 )
* Add prettier as eslint plugin (@wacii in #24 )
* Extract send from middleware. (@wacii in #23 )

<a name="2.1.0"></a>
## [v2.1.0](https://github.com/redux-offline/redux-offline/releases/tag/v2.1.0) (2017-09-11)


### Bug Fixes

* Fix regression in `detectNetwork()`. (@jaulz in #20 )
* Fix package version. (@EvanWillms in #18 )
* Use `completeRetry()` correctly. (@wacii in #15 )
* Removes unsupported code. (@wacii in #12 )
* Fixes redux dev-tools integration. (@wacii in #11 )
* Fixes offline not being restored correctly on persist rehydrate actions. (@wacii in #5 )
* Prevents js errors on commit reducers bubbling up to the rollback. Expose the error with a redux action for handling. (@sorodrigo in #3 )
* Adds fallback to prevent crashes when no Content-Type header is found on `effect.js` . (@sorodrigo in #2 )


### Features

* Adds tests. (@wacii in #6 )
* Changes eslint config to airbnb. (@sorodrigo in #21 )
* Adds netInfo to `detectNetwork.native.js` . (@sorodrigo in #1 )



