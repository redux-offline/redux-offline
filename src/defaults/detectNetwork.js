/* global window */

const handle = (callback, online) => {
  // NetInfo is not supported in browsers, hence we only pass online status
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => callback({ online }));
  } else {
    setTimeout(() => callback({ online }), 0);
  }
};

export default callback => {
  if (typeof window !== 'undefined' && window.addEventListener) {
    document.addEventListener('online', () => handle(callback, true));
    document.addEventListener('offline', () => handle(callback, false));
    handle(callback, window.navigator.onLine);
  }
};
