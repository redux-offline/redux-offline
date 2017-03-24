import { transaction } from 'redux-offline';

const followUserSuccess = userId => ({
  type: 'FOLLOW_USER_COMMIT',
  payload: { userId }
});

const followUserSuccess = userId => ({
  type: 'FOLLOW_USER_COMMIT',
  payload: { userId }
});

const followUserError = userId => ({
  type: 'FOLLOW_USER_ROLLBACK',
  payload: { userId }
});

const followUserOptimistic = userId => ({
  type: 'FOLLOW_USER_REQUEST',
  payload: { userId },
  offline: {
    optimistic: followUserSuccess(userId)
  }
});

const followUserSimplestOptimistic = userId => ({
  type: 'FOLLOW_USER_REQUEST',
  payload: { userId },
  meta: {
    offline: {
      optimistic: true,
      effect: post('/api/follow', { userId })
    }
  }
});

const followUser = userId => ({
  type: 'FOLLOW_USER_REQUEST',
  payload: { userId },
  meta: {
    offline: {
      // the network action to execute
      effect: { url: '/api/follow', method: 'POST', body: { userId } },
      // dispatched when effect succeeds
      commit: { type: 'FOLLOW_USER_COMMIT', meta: { userId } },
      // dispatched if effect fails permanently
      rollback: { type: 'FOLLOW_USER_ROLLBACK', meta: { userId } }
    }
  }
});

const followUser = userId => ({
  type: 'FOLLOW_USER_REQUEST',
  payload: { userId },
  meta: {
    offline: {
      network: post('/api/follow', { userId }),
      commit: followUserSuccess(userId),
      rollback: followUserError(userId)
    }
  }
});

const followReducer = (state, action) => {
  switch (action.type) {
    case 'FOLLOW_USER_COMMIT':
      return { ...state, [action.payload.userId]: true };
    case 'FOLLOW_USER_ROLLBACK':
      return { ...state, [action.payload.userId]: false };
  }
};
