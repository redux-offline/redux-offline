---
sidebar_position: 3
title: "Write Resilience"
---

## That's all she wrote

Persisting and rehydrating state (which is a term we use for reading the state back from the disk and into our store) will get us **Read**-resilience. Our app will work offline as long as the user only wants to read from the state. We also want to support **Write**-resilience: the user should be able to do (some) actions while offline, and be able to safely assume that they will eventually be reconciled and sent to our backend.

In order to support Write-resilience, we will store all network-bound actions in a queue inside our store. Redux Offline creates a state subtree called `offline` where, among other internal state needed by the library, it manages an array called `outbox`.

To be able to perform the network-bound actions after we come back online, we need to store all necessary data to perform the action, and metadata about what should happen afterwards. Redux Offline understands the following metadata:

```diff
type OfflineAction = {
  type: string,
  payload: any,
+ meta: {
+   offline: {
+     effect: any,
+     commit: Action,
+     rollback: Action
+   }
+ }
```

* `meta.offline.effect` is any data you want to send to the reconciler
* `meta.offline.commit` action will be fired once the network effect has been successfully sent
* `meta.offline.rollback` action will be fired if the network effect **permanently** fails (does not count network-related failures, which will be automatically retried)
