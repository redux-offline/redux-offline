---
sidebar_position: 5
title: "Commit"
---

## A pessimist is never disappointed

Sometimes it's important that the user knows that the action actually went through, so you can't optimistically update your state until the effect has been executed. Or sometimes, in order to render the final UI state, you need some data from the server response. For these cases, you can use the `meta.offline.commit` action:

```js
const completeOrder = (orderId, lineItems) => ({
  type: 'COMPLETE_ORDER',
  payload: { orderId, lineItems },
  meta: {
    offline: {
      effect: //...,
      commit: { type: 'COMPLETE_ORDER_COMMIT', meta: { orderId }},
      rollback: { type: 'COMPLETE_ORDER_ROLLBACK', meta: { orderId }}
     }
  }
});

const ordersReducer = (state, action) {
  switch(action.type) {
    case 'COMPLETE_ORDER':
      return {
        ...state,
        submitting: { ...state.submitting, [action.payload.orderId]: true }
      };
    case 'COMPLETE_ORDER_COMMIT':
      return {
        ...state,
        receipts: { ...state.receipts, [action.meta.orderId]: action.payload },
        submitting: omit(state.submitting, [action.meta.orderId])
      };
    case 'COMPLETE_ORDER_ROLLBACK':
      return {
        ...state,
        error: action.payload,
        submitting: omit(state.submitting, [action.meta.orderId])
      };
    default:
      return state;
  }
}
```
