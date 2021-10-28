function succeedAlways() {
  return {
    type: 'SUCCEED_ALWAYS',
    meta: {
      effect: { url: '/succeed-always' },
      commit: { type: 'SUCCEED_ALWAYS_SUCCESS' },
      rollback: { type: 'SUCCEED_ALWAYS_FAILURE' }
    }
  };
}

function succeedSometimes() {
  return {
    type: 'SUCCEED_SOMETIMES',
    meta: {
      effect: { url: '/succeed-sometimes' },
      commit: { type: 'SUCCEED_SOMETIMES_SUCCESS' },
      rollback: { type: 'SUCCEED_SOMETIMES_FAILURE' }
    }
  };
}

function failSometimes(rollback = { type: 'FAIL_SOMETIMES_FAILURE' }) {
  return {
    type: 'FAIL_SOMETIMES',
    meta: {
      effect: { url: '/fail-sometimes' },
      commit: { type: 'FAIL_SOMETIMES_SUCCESS' },
      rollback
    }
  };
}

export { succeedAlways, succeedSometimes, failSometimes };
