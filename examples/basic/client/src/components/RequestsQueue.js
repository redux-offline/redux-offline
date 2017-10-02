import React from "react";
import { connect } from "react-redux";

function RawComponent({ actions }) {
  if (actions.length === 0) {
    return (
      <p>There are no requests</p>
    )
  }

  return (
    <ul>
      {actions.map((action, i) => {
        return (
          <li key={action.meta.transaction}>
            <span>{action.type}</span>
            <span>#{action.meta.transaction}</span>
          </li>
        )
      })}
    </ul>
  );
}

function mapStateToProps(state) {
  return {
    actions: state.offline.outbox
  };
}

const RequestsQueue = connect(mapStateToProps)(RawComponent);

export { RawComponent };
export default RequestsQueue;
