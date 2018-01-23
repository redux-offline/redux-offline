function succeedAlways() {
  return {
    type: 'SUCCEED_ALWAYS',
    meta: {
      offline: {
        effect: { url: '/succeed-always' },
        commit: { type: 'SUCCEED_ALWAYS_SUCCESS' },
        rollback: { type: 'SUCCEED_ALWAYS_FAILURE' }
      }
    }
  };
}

function succeedSometimes() {
  return {
    type: 'SUCCEED_SOMETIMES',
    meta: {
      offline: {
        effect: { url: '/succeed-sometimes' },
        commit: { type: 'SUCCEED_SOMETIMES_SUCCESS' },
        rollback: { type: 'SUCCEED_SOMETIMES_FAILURE' }
      }
    }
  };
}

function failSometimes() {
  return {
    type: 'FAIL_SOMETIMES',
    meta: {
      offline: {
        effect: { url: '/fail-sometimes' },
        commit: { type: 'FAIL_SOMETIMES_SUCCESS' },
        rollback: { type: 'FAIL_SOMETIMES_FAILURE' }
      }
    }
  };
}

export function waterfallStart() {
  return {
    type: 'WATERFALL_START',
    meta: {
      offline: {
        effect: { url: '/succeed-always' },
        commit: { type: 'WATERFALL_START_COMMIT', meta: { observer: 'waterfallMidway' } },
        rollback: { type: 'WATERFALL_START_ROLLBACK' }
      }
    }
  };
}

export function waterfallMidway() {
  return {
    type: 'WATERFALL_MIDWAY',
    meta: {
      offline: {
        effect: { url: '/succeed-always' },
        commit: { type: 'WATERFALL_MIDWAY_COMMIT', meta: { observer: 'waterfallEnd' } },
        rollback: { type: 'WATERFALL_MIDWAY_ROLLBACK' }
      }
    }
  };
}

export function waterfallEnd() {
  return {
    type: 'WATERFALL_END',
    meta: {
      offline: {
        effect: { url: '/succeed-always' },
        commit: { type: 'WATERFALL_END_COMMIT' },
        rollback: { type: 'WATERFALL_END_ROLLBACK' }
      }
    }
  };
}

export { succeedAlways, succeedSometimes, failSometimes };
