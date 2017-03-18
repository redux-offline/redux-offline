const impl = {
  network(effect, action) {
    const { url, ...options } = effect;
    return fetch(url, options);
  },
  persistence(state) {
    return null;
  },
  batching(queue = []) {
    return queue[0];
  },
  discard(error) {
    return error.status && error.status >= 400 && error.status <= 500;
  },
  retry(action, tryCount, maxTries) {
    return null;
  },
  migration(state, currentVersion, migrations) {
    migrations.reduce(
      (nextState, migrate) => {
        return currentVersion >= nextState.version ? nextState : migrate(nextState);
      },
      state
    );
  },
  transient() {
    return false;
  },
  pruning() {
    return null;
  }
};
