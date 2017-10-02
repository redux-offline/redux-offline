import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  succeedAlways,
  succeedSometimes,
  failSometimes
} from "../actions";

function RawComponent({ succeedAlways, succeedSometimes, failSometimes }) {
  return (
    <div>
      <button onClick={succeedAlways}>Succeed Always</button>
      <button onClick={succeedSometimes}>Succeed Sometimes</button>
      <button onClick={failSometimes}>Fail Sometimes</button>
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    succeedAlways,
    succeedSometimes,
    failSometimes
  }, dispatch);
}

const MakeRequests = connect(null, mapDispatchToProps)(RawComponent);

export { RawComponent };
export default MakeRequests;
