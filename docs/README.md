# Table of Contents

* [Readme](../README.md)
* Basics
  * [Getting Started](basics/getting-started.md)
  * [Read Resilience](basics/read-resilience.md)
  * [Write Resilience](basics/write-resilience.md)
  * [Rollback](basics/rollback.md)
  * [Commit](basics/commit.md)
* Recipes
  * [Customize Requests](recipes/customize-requests.md)
  * [Immutable.js](recipes/immutable.md)
  * [Redux-Saga](recipes/redux-saga.md)
  * [Empty outbox](recipes/empty-outbox.md)
* Troubleshooting
  * [Offline queue doesn't trigger on network status change](recipes/troubleshooting/offline-queue-trigger.md)
* API Reference
  * [offline()](api/offline.md)
  * [createOffline()](api/createOffline.md)
  * [config](api/config.md)
    * [defaultCommit](api/config.md#defaultcommit)
    * [defaultRollback](api/config.md#defaultrollback)
    * [detectNetwork](api/config.md#detectnetwork)
    * [discard](api/config.md#discard)
    * [effect](api/config.md#effect)
    * [offlineStateLens](api/config.md#offlinestatelens)
    * [persist](api/config.md#persist)
    * [persistAutoRehydrate](api/config.md#persistautorehydrate)
    * [persistCallback](api/config.md#persistcallback)
    * [persistOptions](api/config.md#persistoptions)
    * [queue](api/config.md#queue)
    * [retry](api/config.md#retry)
    * [[EXPERIMENTAL] returnPromises](api/config.md#returnpromises)
