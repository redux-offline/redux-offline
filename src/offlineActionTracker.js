const subscriptions = [];

function registerAction(transaction) {
  return new Promise((resolve, reject) => {
    subscriptions.push({ transaction, resolve, reject });
  });
}

function resolveAction(transaction, value) {
  const subscription = subscriptions[0];
  if (subscription && subscription.transaction === transaction) {
    subscription.resolve(value);
    subscriptions.shift();
  }
}

function rejectAction(transaction, error) {
  const subscription = subscriptions[0];
  if (subscription && subscription.transaction === transaction) {
    subscription.reject(error);
    subscriptions.shift();
  }
}

export { registerAction, resolveAction, rejectAction };
