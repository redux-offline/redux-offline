---
sidebar_position: 3
title: "Read Resilience"
---

## Persistence is key

In order to render meaningful content when the user opens your application offline, your application state needs to be persisted to disk.

Instead of reinventing the wheel, Redux Offline uses the excellent [redux-persist](https://github.com/rt2zz/redux-persist/tree/v4) library. Your Redux store is saved to disk on every change, and reloaded automatically on startup. By default, browser environments will use [IndexedDB](https://developer.mozilla.org/en/docs/Web/API/IndexedDB_API) or WebSQL/localStorage fallbacks via [localForage](https://github.com/localForage/localForage), and [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) in React Native.

You can [configure every aspect of how your state is persisted](../api/config).
