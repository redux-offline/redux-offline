import React from 'react';
import { connect } from 'react-redux';

function RequestsQueue({ actions }) {
  if (actions.length === 0) {
    return <p>There are no requests</p>;
  }

  return (
    <ul>
      {actions.map(action => (
        <li key={action.meta.transaction}>
          <span>{action.type}</span>
          <span>#{action.meta.transaction}</span>
        </li>
      ))}
    </ul>
  );
}

function mapStateToProps(state) {
  return {
    actions: state.offline.outbox
  };
}

const ConnectedComponent = connect(mapStateToProps)(RequestsQueue);

export { RequestsQueue as RawComponent };
export default ConnectedComponent;
