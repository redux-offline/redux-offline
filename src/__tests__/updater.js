import { enhanceReducer } from  '../updater';
import {
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_STATUS_CHANGED,
  OFFLINE_BUSY,
  RESET_STATE,
  PERSIST_REHYDRATE
} from '../types'

//actions to test  OFFLINE_STATUS_CHANGED,
//   OFFLINE_SCHEDULE_RETRY,
//   OFFLINE_COMPLETE_RETRY,
//   OFFLINE_BUSY,
//   RESET_STATE,
//   PERSIST_REHYDRATE


// mock enque, mock deque

const initialState = {
  busy: false,
  lastTransaction: 0,
  online: false,
  outbox: [],
  retryCount: 0,
  retryScheduled: false,
  netInfo: {
    isConnectionExpensive: null,
    reach: 'NONE'
  }
};


    
    const config = {
        queue:{
        enqueue:jest.fn(),
        dequeue: jest.fn(),

    },
    offlineStateLens:(state: any) => {
        debugger
  const { offline, ...rest } = state;
  return {
    get: offline,
    set: (offlineState: any) =>
      typeof offlineState === 'undefined'
        ? rest
        : { offline: offlineState, ...rest }
  };
}
    }
let enReducer;

    beforeEach(() => {
        enReducer = enhanceReducer(reducer, config);
    })

const reducer = jest.fn((state)=>state)


describe('buildOfflineUpdater updates for all action',()=>{

    test('test offlineStatusChanagedAction', ()=>{
        const offlineStatusChanagedAction=()=>({
        type: OFFLINE_STATUS_CHANGED,
        payload: {
            online: true,
            netInfo: 'netInfo'
        }
    })
       const reducerVal = enReducer({...initialState, offline:{...initialState}}, offlineStatusChanagedAction);
        expect(reducerVal.offline.online).toBe(false)
        
    });
    test('test for action with meta property', ()=>{
        const succeedSomeTime = ()=>({
                type: "SUCCEED_SOMETIMES",
                meta: {offline:{}}
                })
        const reducerVal = enReducer(initialState, succeedSomeTime())
        console.log(config.queue.enqueue)
        expect(config.queue.enqueue).toHaveBeenCalled();
    })
})