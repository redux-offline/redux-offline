import { OFFLINE_SERIALIZE, OFFLINE_UPDATE_NETINFO } from './actions';

const initialState = { outbox: [], busy: false, online: false };

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
  if (action.type === OFFLINE_UPDATE_NETINFO) {
    const { netInfo } = action.payload;
    return { ...state, netInfo };
  }
  return state;
}

export default offlineReducer;
