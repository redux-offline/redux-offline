// @flow
export default (state: any) => {
  const { offline, ...rest } = state;
  return {
    get: offline,
    set: (offlineState: any) =>
      typeof offlineState === 'undefined'
        ? rest
        : { offline: offlineState, ...rest }
  };
};
