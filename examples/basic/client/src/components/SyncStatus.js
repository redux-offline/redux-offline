import React from 'react';
import { connect } from 'react-redux';

function SyncStatus({ timer, busy, retryScheduled, attempt }) {
  if (!busy && !retryScheduled) {
    return <p>Synced</p>;
  } else if (busy) {
    return <p>Waiting on request - Attempt #{attempt}</p>;
  }
  return (
    <p>
      Waiting on retry: {timer}s - Attempt #{attempt}
    </p>
  );
}

function mapStateToProps(state) {
  return {
    timer: state.timer,
    busy: state.offline.busy,
    retryScheduled: state.offline.retryScheduled,
    attempt: state.offline.retryCount + 1
  };
}

const ConnectedComponent = connect(mapStateToProps)(SyncStatus);

export { SyncStatus as RawComponent };
export default ConnectedComponent;
