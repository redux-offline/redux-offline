import { OFFLINE_SERIALIZE } from './actions';

const initialState = { outbox: [], busy: false, online: true };

function offlineReducer(state = initialState, action) {
  if (action.type === OFFLINE_SERIALIZE) {
    const { status, retryScheduled, ...newState } = action.payload;
    const online = status !== 'paused';
    const busy = status === 'busy';
    return {
      ...state,
      ...newState,
      retryScheduled: Boolean(retryScheduled),
      online,
      busy
    };
  }
  return state;
}

export default offlineReducer;
