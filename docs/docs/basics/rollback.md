---
sidebar_position: 4
title: "Rollback"
---

## Optimism will get you places

When the initial action has been dispatched, you can update your application state in your reducers as you normally would.

A common pattern for offline-friendly apps is to *optimistically update  UI state*. In practice, this means that as soon as a user performs an action, we update the UI to look as if the action had already succeeded. This makes our applications resilient to network latency, and improves the perceived performance of our app.

When we optimistically update state, we need to ensure that if the action does permanently fail, the user is appropriately notified and the application state is rolled back. To allow you this opportunity, Redux Offline will fire the action you specified in `meta.offline.rollback`. The error object returned by the effects reconciler will be set as the payload.

An example of an optimistic update:
```js
const action = userId => ({
  type: 'FOLLOW_USER',
  payload: { userId },
  meta: {
    offline: {
      effect: //...,
      rollback: { type: 'FOLLOW_USER_ROLLBACK', meta: { userId }}
     }
  }
});

// optimistically update the state, revert on rollback
const followingUsersReducer = (state, action) {
  switch(action.type) {
    case 'FOLLOW_USER':
      return { ...state, [action.payload.userId]: true };
    case 'FOLLOW_USER_ROLLBACK':
      return omit(state, [action.meta.userId]);
    default:
      return state;
  }
}
```
