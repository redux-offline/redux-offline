type DetectNetworkCallback = ({ online: boolean }) => void;

const handle = (callback: DetectNetworkCallback, online: boolean) => {
  // NetInfo is not supported in browsers, hence we only pass online status
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => callback({ online }));
  } else {
    setTimeout(() => callback({ online }), 0);
  }
};

function detectNetwork(callback: DetectNetworkCallback) {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', () => handle(callback, true));
    window.addEventListener('offline', () => handle(callback, false));
    handle(callback, window.navigator.onLine);
  }
}

export default detectNetwork;
