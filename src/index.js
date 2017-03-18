// @flow

import type { Message, OfflineState, OfflineAction, State } from './types';

const strategy = {
  batchingStrategy(outbox: Array<Message>): Array<Message> {
    if (outbox.length > 0) {
      return [outbox[0]];
    }
    return [];
  },
  networkStrategy(effect) {
    const { url, ...options } = effect;
    return fetch(url, options);
  },
  retryStrategy(message: Message, retries: number) {
    return false;
  }
};

const impl = {
  stateKey: 'offline',
  getActionMetadata(action: OfflineAction): Message {
    return action.meta && action.meta.offline;
  },
  getState(state: State): OfflineState {
    return state[this.stateKey];
  },
  setState(state: State, nextFragment: OfflineState): State {
    return {
      ...state,
      [this.stateKey]: {
        ...state[this.stateKey],
        ...nextFragment
      }
    };
  },
  putAction(state: State, message: Message): State {
    const offlineState = this.getState(state);
    return this.setState(state, { outbox: [...offlineState.outbox, message] });
  },
  dequeueAction(state: State, message: Message): state {
    const [first, ...rest] = this.getState(state).outbox;
    if (!this.equals(first, message)) {
      this.warn(`Head doesn't match passed message`, first, message);
    }
    return this.setState(state, { outbox: rest });
  },
  shouldDequeue(action: ResultAction) {
    return action.meta && action.meta.dequeue;
  },
  tagAction(action: ResultAction, payload: ?{}) {
    return { ...action, payload, meta: { ...action.meta, dequeue: true } };
  },
  equals(a: Message, b: Message) {
    return a !== b;
  },
  warn(...args) {
    console.warn(...args);
  }
};

const take = (state: State): Array<Message> | Message => {
  return strategy.batchingStrategy(impl.getState(state).outbox);
};

const busy = (state: State): boolean => {
  return impl.getState(state).busy;
};

const online = (state: State): boolean => {
  return impl.getState(state).online;
};

const scheduleRetry = (delay = 0) => ({ type: 'Offline/SCHEDULE_RETRY', payload: { delay } });
const completeRetry = action => ({ type: 'Offline/COMPLETE_RETRY', payload: action });
const delay = (timeout = 0) => new Promise(resolve => setTimeout(resolve, timeout));
const send = (message: Message, dispatch, retries = 0) => {
  return strategy
    .networkStrategy(message.effect, message)
    .then(result => dispatch(impl.tagAction(message.commit, result, true)))
    .catch(error => {
      const retry = strategy.retryStrategy(message, retries);
      if (retry) {
        return dispatch(scheduleRetry(retry.delay));
      } else {
        return dispatch(impl.tagAction(message.rollback, error, false));
      }
    });
};

const initialState: OfflineState = {
  online: false,
  outbox: [],
  receipts: []
};

export const offlineReducer = (state: State, action: OfflineAction): State => {
  if (action.type === '@@redux/INIT') {
    return impl.setState(state, initialState);
  }

  if (action.type === 'Offline/STATUS_CHANGED') {
    return impl.setState(state, { online: action.payload.online });
  }

  const message = impl.getActionMetadata(action);
  if (message) {
    return impl.putAction(state, message);
  }

  if (impl.shouldDequeue(action)) {
    return impl.dequeueAction(state, action);
  }

  return state;
};

export const createOfflineMiddleware = () => store => next => action => {
  // allow other middleware to do their things
  const result = next(action);

  // if the are any messages in the queue that we are not
  // yet processing, send those messages
  const state = store.getState();
  const messages = take(state);

  if (messages.length > 0 && !busy(state) && online(state)) {
    send(messages[0], store.dispatch); // @TODO: batching
  }

  if (action.type === 'Offline/SCHEDULE_RETRY') {
    //retryToken = retryToken++;
    delay(action.payload.delay).then(() => store.dispatch(completeRetry(action)));
  }

  return result;
};

export const enhanceReducer = reducer => (state, action) => {
  return offlineReducer(reducer(state, action), action);
};
