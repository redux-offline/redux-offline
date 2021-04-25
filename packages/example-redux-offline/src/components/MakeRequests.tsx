import React from 'react';
import { connect } from 'react-redux';
import { succeedAlways, succeedSometimes, failSometimes } from '../actions';

const MakeRequests: React.FC<{
  onSucceedAlways: () => void;
  onSucceedSometimes: () => void;
  onFailSometimes: () => void;
}> = (props) => {
  const onSucceedAlways = () => props.onSucceedAlways();
  const onSucceedSometimes = () => props.onSucceedSometimes();
  const onFailSometimes = () => props.onFailSometimes();

  return (
    <div>
      <button onClick={onSucceedAlways}>Succeed Always</button>
      <button onClick={onSucceedSometimes}>Succeed Sometimes</button>
      <button onClick={onFailSometimes}>Fail Sometimes</button>
    </div>
  );
};

const mapDispatchToProps = {
  onSucceedAlways: succeedAlways,
  onSucceedSometimes: succeedSometimes,
  onFailSometimes: failSometimes
};

const ConnectedComponent = connect(null, mapDispatchToProps)(MakeRequests);

export { MakeRequests as RawComponent };
export default ConnectedComponent;
