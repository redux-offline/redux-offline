import { useEffect, useRef } from 'react';
import createPersistedReducer from 'use-persisted-reducer';
import { offlineSideEffects } from '@redux-offline/offline-side-effects';
import detectNetwork from '@redux-offline/detect-network';
import reducer, { initialState } from './reducer';

const usePersistedOutbox = createPersistedReducer('offline-side-effects');
const useAppStateReducer = createPersistedReducer('app-state');

const toggleBusy = payload => ({ type: 'busy', payload });

const useOfflineSideEffects = listeners => {
  const offlineReducer = (_, newState) => ({ ...newState });
  const [persistedState, persist] = usePersistedOutbox(offlineReducer, {});
  const { addSideEffect, setPaused, rehydrateState, restart, reset } = useRef(
    offlineSideEffects({ ...listeners, onSerialize: persist })
  ).current;
  const rehydrate = useRef(() => rehydrateState(persistedState)).current;
  return {
    addSideEffect,
    setPaused,
    rehydrate,
    restart,
    reset
  };
};

function App() {
  const [state, dispatch] = useAppStateReducer(reducer, initialState);
  const listeners = {
    onRequest: dispatch,
    onRollback: (error, action) => dispatch({ ...action, payload: error }),
    onCommit: (data, action) => dispatch({ ...action, payload: data }),
    onStatusChange: status => dispatch(toggleBusy(status))
  };

  const { addSideEffect, setPaused, rehydrate } = useOfflineSideEffects(listeners);

  useEffect(() => {
    rehydrate();
    detectNetwork(({ online }) => setPaused(!online));
  }, [rehydrate, setPaused]);

  useEffect(() => {
    let id = state.users.length + 1;
    const makeRequest = _id =>
      // @ts-ignore
      addSideEffect({
        type: 'request',
        payload: { _id },
        meta: {
          effect: { url: `https://jsonplaceholder.typicode.com/todos/${_id}` },
          commit: { type: 'commit', meta: { _id } },
          rollback: { type: 'rollback', meta: { _id } }
        }
      });
    const onKeyPress = e => {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
      }
      makeRequest(id);
      // React is too slow updating this value
      id += 1;
    };
    window.addEventListener('keypress', onKeyPress);

    return () => {
      window.removeEventListener('keypress', onKeyPress);
    };
    // React is too slow updating state.users value,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addSideEffect]);

  const onClickRefresh = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{ margin: '12px 20px' }}>
      <div style={{ height: 220, padding: '0 15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p>status: {state.status} </p>
            <p>progress: {state.progress}</p>
          </div>
          <pre style={{ height: 120, width: '50%', overflow: 'scroll' }}>
            <code>{state.commitData && JSON.stringify(state.commitData, null, 2)}</code>
          </pre>
          <div>
            <button onClick={onClickRefresh}>Refresh</button>
          </div>
        </div>
        <h1 style={{ textAlign: 'center' }}>Press and hold any key!</h1>
      </div>
      <div style={{ overflow: 'auto', height: 'calc(100vh - 260px)' }}>
        <ol reversed>
          {state.users.map(user => (
            <li key={user.id} style={{ color: user.rolledback ? '#ff0000' : '#000000' }}>
              <p>{user.title}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default App;
