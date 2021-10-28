import { Options, Listeners, Context, State } from './types';
import { defaults } from './defaults';
import { createUpdater } from './updater';
import { createTriggers } from './triggers';
import { createStream } from './stream';

export const offlineSideEffects = (
  providedListeners: Partial<Listeners>,
  providedOptions?: Options,
  providedState?: Partial<State>
) => {
  const listeners = {
    onRequest: () => {},
    onCommit: () => {},
    onRollback: () => {},
    onStatusChange: () => {},
    onSerialize: () => {},
    onRetry: () => {},
    ...providedListeners
  };
  const options = {
    ...defaults,
    ...providedOptions
  };
  const updater = createUpdater(options, listeners, providedState);
  const context: Context = {
    options,
    listeners,
    updater
  };
  const stream = createStream(context);
  const {
    rehydrateState,
    actionWasRequested,
    togglePause,
    restartProcess,
    resetState
  } = createTriggers(stream, context);

  return {
    rehydrateState,
    addSideEffect: actionWasRequested,
    setPaused: togglePause,
    restart: restartProcess,
    reset: resetState
  };
};
