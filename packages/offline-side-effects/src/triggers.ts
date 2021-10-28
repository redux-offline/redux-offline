import { Action, Context, Stream, Updates, State } from './types';

export function createTriggers(stream: Stream, { updater, listeners }: Context) {
  const [state, updateState] = updater;

  const actionWasRequested = (action: Action) => {
    if (action.meta?.effect) {
      const request = { ...action };
      updateState(Updates.enqueue, request);
      listeners.onRequest(request);
    }
    stream.start();
  };

  const togglePause = (paused: boolean) => {
    updateState(Updates.pause, paused);
    listeners.onStatusChange(state.status);
    if (!paused) {
      stream.start();
    }
  };

  const rehydrateState = (newState: State) => {
    updateState(Updates.rehydrate, { ...newState });
    if (state.outbox.length > 0) {
      stream.start();
    }
  };

  const restartProcess = () => {
    stream.start();
  };

  const resetState = () => {
    updateState(Updates.reset);
    stream.start();
  };

  return {
    actionWasRequested,
    togglePause,
    rehydrateState,
    restartProcess,
    resetState
  };
}
