<p>
  <img alt="redux-offline" src="docs/logo.png" width="300"></img>
</p>
<p>
  <a title='License' href="https://raw.githubusercontent.com/redux-offline/redux-offline/master/LICENSE" height="18">
    <img src='https://img.shields.io/badge/license-MIT-blue.svg' />
  </a>
  <a href="https://badge.fury.io/js/%40redux-offline%2Fredux-offline">
    <img src="https://badge.fury.io/js/%40redux-offline%2Fredux-offline.svg" alt="npm version" height="18">
  </a>
  <a href="https://travis-ci.org/redux-offline/redux-offline">
    <img src="https://travis-ci.org/redux-offline/redux-offline.svg?branch=master" alt="travis" height="18">
  </a>
</p>

Persistent Redux store for _Reasonaboutable_:tm: Offline-First applications, with first-class support for optimistic UI. Use with React, React Native, or as standalone state container for any web app.

> Redux Offline is now being maintained by a community driven team. The new versions of the library will now be available under the npm organization `@redux-offline`. Big thank you to [@jevakallio](https://github.com/jevakallio) for creating this amazing library in the first place.

## Quick start

##### 1. Install with npm (or [Yarn](https://yarnpkg.com))

##### For React Native 0.60+
```shell
npm install --save @redux-offline/redux-offline@native
```

#### For React Native Expo SDK 36
```shell
npm install --save @redux-offline/redux-offline@expo
```

#### For React Native <= 0.59
```shell
npm install --save @redux-offline/redux-offline
```

#### External dependencies for React Native
* Async Storage [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage)
* NetInfo [@react-native-community/netinfo](https://github.com/react-native-netinfo/react-native-netinfo)

##### 2. Add the `offline` [store enhancer](http://redux.js.org/docs/Glossary.html#store-enhancer) with `compose`
```js

import { applyMiddleware, createStore, compose } from 'redux';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';

// ...

const store = createStore(
  reducer,
  preloadedState,
  compose(
    applyMiddleware(middleware),
    offline(offlineConfig)
  )
);
```

##### 3. Decorate actions with offline metadata

```js
const followUser = userId => ({
  type: 'FOLLOW_USER_REQUEST',
  payload: { userId },
  meta: {
    offline: {
      // the network action to execute:
      effect: { url: '/api/follow', method: 'POST', json: { userId } },
      // action to dispatch when effect succeeds:
      commit: { type: 'FOLLOW_USER_COMMIT', meta: { userId } },
      // action to dispatch if network action fails permanently:
      rollback: { type: 'FOLLOW_USER_ROLLBACK', meta: { userId } }
    }
  }
});
```

If the effect payload is something other than JSON you can pass the body and headers:

```js
const registerUser = (name, email) => ({
  type: 'REGISTER_USER',
  payload: { name, email },
  meta: {
    offline: {
      // the network action to execute:
      effect: { url: '/api/register', method: 'POST', body: `name=${name}&email=${email}`, headers: { 'content-type': 'application/x-www-form-urlencoded' } },
      // action to dispatch when effect succeeds:
      commit: { type: 'REGISTER_USER_COMMIT', meta: { name, email } },
      // action to dispatch if network action fails permanently:
      rollback: { type: 'REGISTER_USER_ROLLBACK', meta: { name, email } }
    }
  }
});
```

##### 4. (React Native Android) Ask permission to read network status

If writing a native app for Android, you'll need to make sure to request the permission to access network state in your `AndroidManifest.xml`:

```xml
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```
* * *

See [Documentation](docs/README.md) for configuration options, the full API, and common recipes.

## Contributing

Improvements and additions welcome. For large changes, please submit a discussion issue before jumping to coding; we'd hate you to waste the effort.

If you are reporting a bug, please include code that reproduces the error. Here is a starting application on [CodeSandbox](https://codesandbox.io/s/8xml9l1r0j).

In lieu of a formal style guide, follow the included eslint rules, and use Prettier to format your code.

## Miscellanea

### Usage with Redux Persist v5

In case you want to use a custom [redux-persist](https://github.com/rt2zz/redux-persist) version, there is an
[example](https://gist.github.com/jarvisluong/f14872b9c7ed00bc2afc89c4622e3b55) configuration.

### Prior art

Redux Offline is a distillation of patterns discovered while building apps using previously existing libraries:

* Forbes Lindesay's [redux-optimist](https://github.com/ForbesLindesay/redux-optimist)
* Zack Story's [redux-persist](https://github.com/rt2zz/redux-persist/tree/v4)

Without their work, Redux Offline wouldn't exist. If you like the ideas behind Redux Offline, but want to build your own stack from lower-level components, these are good places to start.

### License

MIT
