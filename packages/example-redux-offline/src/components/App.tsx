import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import MakeRequests from './MakeRequests';
import RequestsQueue from './RequestsQueue';
import SyncStatus from './SyncStatus';
import store, { persistor } from '../store';

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <div className="container">
          <div>
            <SyncStatus />
            <RequestsQueue />
            <MakeRequests />
          </div>
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
