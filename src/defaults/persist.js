import { persistStore } from 'redux-persist';

export default store => {
  return persistStore(store);
};
