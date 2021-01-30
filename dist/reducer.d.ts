declare function offlineReducer(state: {
    outbox: any[];
    busy: boolean;
    online: boolean;
}, action: any): any;
export default offlineReducer;
