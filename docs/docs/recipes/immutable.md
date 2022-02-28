---
sidebar_position: 2
title: Immutable
---

# Use an [Immutable](https://facebook.github.io/immutable-js/) store

The `offline` state branch created by Redux Offline needs to be a vanilla JavaScript object. If your entire store is immutable you should check out [`redux-offline-immutable-config`](https://github.com/anyjunk/redux-offline-immutable-config) which provides drop-in configurations using immutable counterparts and code examples. If you use Immutable in the rest of your store, but not the root object, you should not need extra configurations.
