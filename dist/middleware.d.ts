declare function createReduxOfflineMiddleware(offlineSideEffects: any): () => (next: any) => (action: any) => void;
export default createReduxOfflineMiddleware;
