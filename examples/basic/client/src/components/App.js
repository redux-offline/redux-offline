import React from 'react';
import { Provider } from 'react-redux';
import MakeRequests from './MakeRequests';
import RequestsQueue from './RequestsQueue';
import SyncStatus from './SyncStatus';
import store from '../store';

function App() {
  return (
    <Provider store={store}>
      <div>
        <SyncStatus />
        <RequestsQueue />
        <MakeRequests />
      </div>
    </Provider>
  );
}

export default App;
