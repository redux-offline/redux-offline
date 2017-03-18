// import httpFetch from 'redux-offline/network/httpFetch';
// import localStorage from 'redux-offline/persistence/localStorage';
// import oneAtATime from 'redux-offline/batching/oneAtATime';
// import decayingSchedule from 'redux-offline/retry/decayingSchedule';
// import httpErrors from 'redux-offline/error/httpErrors';
// import versioned from 'redux-offline/migration/versioned';

const httpFetchNetworkStrategy = config => (effect, action) => null;

const localStoragePersistenceStrategy = ({ key }) => state => null;

const oneAtATimeBatchingStrategy = () => queue => queue[0];

const decayingSchedule = () => null;
