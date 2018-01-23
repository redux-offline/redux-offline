import React from 'react';
import MakeRequests from '../components/MakeRequests';
import RequestsQueue from '../components/RequestsQueue';
import SyncStatus from '../components/SyncStatus';

export default class Promise extends React.Component {
  state = {
    status: '',
    time: null,
    payload: '--null--'
  }

  onSuccess = payload => this.setState(() => ({
      time: Date.now(),
      status: 'success',
      payload: JSON.stringify(payload, null, '  ')
    }));

  onError = payload => this.setState(() => ({
      time: Date.now(),
      status: 'error',
      payload: JSON.stringify(payload, null, '  ')
    }));

  render() {
    const { goBack} = this.props;
    const { status, payload, time } = this.state;
    return (
      <div className="container">
        <div>
          <SyncStatus />
          <RequestsQueue />
          <MakeRequests
            successCallback={this.onSuccess}
            errorCallback={this.onError}
          />
          <button onClick={goBack}> back </button>
        </div>
        <pre className={`code-box ${status}`}>
          <p>{status} {time}</p>
          <code>{payload}</code>
        </pre>
      </div>
    );
  }
}
