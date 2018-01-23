import React from 'react';
import MakeRequests from '../components/MakeRequests';
import RequestsQueue from '../components/RequestsQueue';
import SyncStatus from '../components/SyncStatus';

export default ({ goBack }) => (
  <div>
    <SyncStatus />
    <RequestsQueue />
    <MakeRequests />
    <button onClick={goBack}> back </button>
  </div>
);
