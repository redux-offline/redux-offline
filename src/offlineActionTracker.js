const subscriptions = [];

function registerAction(transaction) {
  return new Promise((resolve, reject) => {
    subscriptions.push({ transaction, resolve, reject });
  });
}

function resolveAction(transaction, value) {
  const idx = subscriptions.findIndex(
    sub => sub && sub.transaction === transaction
  );
  const subscription = subscriptions[idx];
  if (subscription) {
    subscription.resolve(value);
    delete subscriptions[idx];
  }
}

function rejectAction(transaction, error) {
  const idx = subscriptions.findIndex(
    sub => sub && sub.transaction === transaction
  );
  const subscription = subscriptions[idx];
  if (subscriptions) {
    subscription.reject(error);
    delete subscriptions[idx];
  }
}

const withPromises = {
  registerAction,
  resolveAction,
  rejectAction
};

const withoutPromises = {
  registerAction() {},
  resolveAction() {},
  rejectAction() {}
};

export default {
  withPromises,
  withoutPromises
};
