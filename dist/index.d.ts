import offlineReducer from './reducer';
export declare const createOffline: (options: any, buildListeners?: () => {}) => {
    enhanceStore: (createStore: any) => (reducer: any, preloadedState: any, enhancer: any) => any;
    reducer: typeof offlineReducer;
    middleware: () => (next: any) => (action: any) => void;
};
