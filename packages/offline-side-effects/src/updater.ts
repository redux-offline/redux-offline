import { State, UpdateState, Updater, Updates, Options, Listeners, Action } from './types';

const initialState: State = {
  outbox: [],
  status: 'idle', // 'idle', 'busy', 'paused
  retryScheduled: null,
  retryCount: 0,
  lastTransaction: 0
};

export const createUpdater = (options: Options, listeners: Listeners): Updater => {
  const state = { ...initialState };
  const updateState: UpdateState = (type: Updates, payload = null) => {
    if (type === Updates.rehydrate) {
      if (payload.outbox) {
        state.outbox = [...payload.outbox];
      }
    }
    if (type === Updates.toggleBusy) {
      if (state.status === 'idle') {
        state.status = 'busy';
      } else if (state.status === 'busy') {
        state.status = 'idle';
      }
    }
    if (type === Updates.pause) {
      state.status = payload ? 'paused' : 'idle';
    }
    if (type === Updates.enqueue) {
      const transaction = state.lastTransaction + 1;
      payload.meta = { ...payload.meta, transaction };
      state.outbox = options.queue.enqueue(state.outbox, payload);
      state.lastTransaction = transaction;
    }
    if (type === Updates.dequeue) {
      state.outbox = options.queue.dequeue(state.outbox, payload as Action);
      state.retryCount = initialState.retryCount;
    }
    if (type === Updates.scheduleRetry) {
      state.retryScheduled = payload;
      state.retryCount = state.retryCount + 1;
    }
    if (type === Updates.completeRetry) {
      state.retryScheduled = initialState.retryScheduled;
    }
    if (type === Updates.reset) {
      Object.assign(state, initialState);
    }

    listeners.onSerialize(state);
  };

  return [state, updateState];
};
