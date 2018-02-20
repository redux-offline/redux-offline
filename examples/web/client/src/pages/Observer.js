import React from 'react';
import RequestsQueue from '../components/RequestsQueue';
import SyncStatus from '../components/SyncStatus';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { waterfallStart } from '../actions';

class Observer extends React.Component {
  render() {
    const { goBack, waterfallStep, start, waterfallResult } = this.props;
    const getActive = step => (waterfallStep === step ? 'active' : '');

    const codeBlock = isActive => isActive && (
      <pre className="code-box auto">
        <code>
          {JSON.stringify(waterfallResult, null, '  ')}
        </code>
      </pre>
    )
    return (
      <div>
        <div>
          <SyncStatus />
          <RequestsQueue />
          <button onClick={start}> start </button>
          <button onClick={goBack}> back </button>
        </div>
        <div className="container">
          <div className={`waterfall-step ${getActive(1)}`}>
            start
            {codeBlock(waterfallStep === 1)}
          </div>
          <div className={`waterfall-step ${getActive(2)}`}>
            midway
            {codeBlock(waterfallStep === 2)}          </div>
          <div className={`waterfall-step ${getActive(3)}`}>
            end
            {codeBlock(waterfallStep === 3)}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    waterfallStep: state.waterfallStep,
    waterfallResult: state.waterfallResult
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      start: waterfallStart
    },
    dispatch
  );
}

const ObserverContainer = connect(mapStateToProps, mapDispatchToProps)(Observer);

export { Observer };
export default ObserverContainer;
