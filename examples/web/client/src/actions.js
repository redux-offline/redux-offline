function succeedAlways() {
  return {
    type: 'SUCCEED_ALWAYS',
    meta: {
      effect: '/succeed-always',
      commit: { type: 'SUCCEED_ALWAYS_SUCCESS' },
      rollback: { type: 'SUCCEED_ALWAYS_FAILURE' }
    }
  };
}

function succeedSometimes() {
  return {
    type: 'SUCCEED_SOMETIMES',
    meta: {
      effect: '/succeed-sometimes',
      commit: { type: 'SUCCEED_SOMETIMES_SUCCESS' },
      rollback: { type: 'SUCCEED_SOMETIMES_FAILURE' }
    }
  };
}

function failSometimes(rollback = { type: 'FAIL_SOMETIMES_FAILURE' }) {
  return {
    type: 'FAIL_SOMETIMES',
    meta: {
      effect: '/fail-sometimes',
      commit: { type: 'FAIL_SOMETIMES_SUCCESS' },
      rollback: rollback
    }
  };
}

export { succeedAlways, succeedSometimes, failSometimes };
