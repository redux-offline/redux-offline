/* global window */

const handle = (callback, online) => {
  // NetInfo is not supported in browsers, hence we only pass online status
  const callback2 = callback.bind(null, { online });

  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(callback2);
  } else {
    setTimeout(callback2, 0);
  }
};

export default callback => {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', () => handle(callback, true));
    window.addEventListener('offline', () => handle(callback, false));
    handle(callback, window.navigator.onLine);
  }
};
