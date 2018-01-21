import React from 'react';
import { Provider } from 'react-redux';
import MakeRequests from './MakeRequests';
import RequestsQueue from './RequestsQueue';
import SyncStatus from './SyncStatus';
import store from '../store';

class App extends React.Component {

  state = {
    page: 'home',
    status: '',
    time: null,
    payload: '--null--'
  };

  pages = {
    home: { page: 'home', status: '', payload: '--null--', time: null },
    basic: { page: 'basic', status: '', payload: '--null--', time: null },
    promise: { page: 'promise' }
  }

  onSuccess = payload => this.setState(() => ({
    time: Date.now(),
    status: 'success',
    payload: JSON.stringify(payload, null, '  ')
  }))

  onError = payload => this.setState(() => ({
    time: Date.now(),
    status: 'error',
    payload: JSON.stringify(payload, null, '  ')
  }))

  render() {
    const { page, status, payload, time } = this.state;
    if (page === 'home') {
      return (
        <div>
          <button onClick={() => this.setState(this.pages.basic)}>
            basic
          </button>
          <button onClick={() => this.setState(this.pages.promise)}>
            promise
          </button>
        </div>
      );
    }

    return (
      <Provider store={store}>
        <div className="container">
          <div>
            <SyncStatus />
            <RequestsQueue />
            <MakeRequests
              successCallback={page === 'promise' && this.onSuccess}
              errorCallback={page === 'promise' && this.onError}
            />
            <button
              onClick={() => this.setState(this.pages.home)}>
              home
            </button>
          </div>
          {page === 'promise' &&
            <pre className={`promise-box ${status}`}>
              <p>{status} {time}</p>
              <code>{payload}</code>
            </pre>
          }
        </div>
      </Provider>
    );
  }
}

export default App;
