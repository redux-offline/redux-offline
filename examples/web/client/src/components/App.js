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
    payload: '--null--'
  };

  onSuccess = payload => this.setState({
    status: 'success',
    payload: JSON.stringify(payload, null, '  ')
  })

  onError = payload => this.setState({
    status: 'error',
    payload: JSON.stringify(payload, null, '  ')
  })

  render() {
    const { page, status, payload } = this.state;
    if (page === 'home') {
      return (
        <div>
          <button onClick={() => this.setState({ page: 'basic' })}>
            basic
          </button>
          <button onClick={() => this.setState({ page: 'promise' })}>
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
            <button onClick={() => this.setState({ page: 'home' })}>
              home
            </button>
          </div>
          {page === 'promise' &&
            <pre className={`promise-box ${status}`}>
              <code>{payload}</code>
            </pre>
          }
        </div>
      </Provider>
    );
  }
}

export default App;
