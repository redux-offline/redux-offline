
const reduxOfflineThunkMiddleware = thunks => store => next => action => {
  const result = next(action)

  if (typeof action === 'object'
    && action.meta && action.meta.thunk
    && typeof action.meta.thunk === 'object'
  ) {
    store.dispatch(thunks[action.meta.thunk.functionName].apply(null, action.meta.thunk.params))
  }
  
  return result
}

export default reduxOfflineThunkMiddleware
