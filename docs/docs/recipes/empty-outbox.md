---
sidebar_position: 4
---

# Empty Outbox

If you want to drop any unresolved offline actions (for instance when a user logs out, switches to a different organisation)

Dispatch a reset state event as follows:

```js
import { RESET_STATE } from "@redux-offline/redux-offline/lib/constants";
store.dispatch({ type: RESET_STATE });
```
