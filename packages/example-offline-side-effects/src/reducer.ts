import produce from 'immer';

// USER LAND REDUCER
export const initialState = {
  status: 'idle',
  commitData: null,
  progress: 'idle',
  users: []
};

function reducer(state = initialState, action: any) {
  return produce(state, draft => {
    const getIndexToUpdate = id => draft.users.findIndex(user => user.id === id);
    if (action.type === 'busy') {
      draft.status = action.payload;
    }

    if (action.type === 'request') {
      draft.progress = `processing request ${action.payload._id}`;
      draft.commitData = null;
      // @ts-ignore
      draft.users.unshift({ id: action.payload._id, title: 'Loading... ⏳' });
    }
    if (action.type === 'commit') {
      draft.progress = `committed ${action.payload.id}`;
      draft.commitData = action.payload;
      const index = getIndexToUpdate(action.meta._id);
      draft.users.splice(index, 1, action.payload);
    }
    if (action.type === 'rollback') {
      draft.progress = `rolled back ${action.meta._id}`;
      draft.commitData = null;
      const index = getIndexToUpdate(action.meta._id);
      draft.users[index].rolledback = true;
      draft.users[index].title = 'Failed ❌';
    }
  });
}

export default reducer;
