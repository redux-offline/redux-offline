/*global window*/

const handle = (callback, result) => {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => callback(result));
  } else {
    setTimeout(() => callback(result), 0);
  }
};

export default callback => {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', () => handle(callback, true));
    window.addEventListener('offline', () => handle(callback, false));
    handle(callback, window.navigator.onLine);
  }
};
