"use strict";

Object.defineProperty(module.exports, "babelPluginFlowReactPropTypes_proptype_ResultAction", {
  value: require("react").PropTypes.shape({
    type: require("react").PropTypes.string.isRequired,
    payload: require("react").PropTypes.shape({}),
    meta: require("react").PropTypes.shape({
      success: require("react").PropTypes.bool.isRequired,
      completed: require("react").PropTypes.bool.isRequired
    }).isRequired
  })
});
Object.defineProperty(module.exports, "babelPluginFlowReactPropTypes_proptype_OfflineMetadata", {
  value: require("react").PropTypes.shape({
    effect: require("react").PropTypes.shape({}).isRequired,
    commit: require("react").PropTypes.shape({
      type: require("react").PropTypes.string.isRequired,
      payload: require("react").PropTypes.shape({}),
      meta: require("react").PropTypes.shape({
        success: require("react").PropTypes.bool.isRequired,
        completed: require("react").PropTypes.bool.isRequired
      }).isRequired
    }).isRequired,
    rollback: require("react").PropTypes.shape({
      type: require("react").PropTypes.string.isRequired,
      payload: require("react").PropTypes.shape({}),
      meta: require("react").PropTypes.shape({
        success: require("react").PropTypes.bool.isRequired,
        completed: require("react").PropTypes.bool.isRequired
      }).isRequired
    }).isRequired
  })
});
Object.defineProperty(module.exports, "babelPluginFlowReactPropTypes_proptype_Receipt", {
  value: require("react").PropTypes.shape({
    message: require("react").PropTypes.shape({
      effect: require("react").PropTypes.shape({}).isRequired,
      commit: require("react").PropTypes.shape({
        type: require("react").PropTypes.string.isRequired,
        payload: require("react").PropTypes.shape({}),
        meta: require("react").PropTypes.shape({
          success: require("react").PropTypes.bool.isRequired,
          completed: require("react").PropTypes.bool.isRequired
        }).isRequired
      }).isRequired,
      rollback: require("react").PropTypes.shape({
        type: require("react").PropTypes.string.isRequired,
        payload: require("react").PropTypes.shape({}),
        meta: require("react").PropTypes.shape({
          success: require("react").PropTypes.bool.isRequired,
          completed: require("react").PropTypes.bool.isRequired
        }).isRequired
      }).isRequired
    }).isRequired,
    success: require("react").PropTypes.bool.isRequired,
    result: require("react").PropTypes.shape({}).isRequired
  })
});
Object.defineProperty(module.exports, "babelPluginFlowReactPropTypes_proptype_OfflineAction", {
  value: require("react").PropTypes.shape({
    type: require("react").PropTypes.string.isRequired,
    payload: require("react").PropTypes.shape({}),
    meta: require("react").PropTypes.shape({
      transaction: require("react").PropTypes.number,
      offline: require("react").PropTypes.shape({
        effect: require("react").PropTypes.shape({}).isRequired,
        commit: require("react").PropTypes.shape({
          type: require("react").PropTypes.string.isRequired,
          payload: require("react").PropTypes.shape({}),
          meta: require("react").PropTypes.shape({
            success: require("react").PropTypes.bool.isRequired,
            completed: require("react").PropTypes.bool.isRequired
          }).isRequired
        }).isRequired,
        rollback: require("react").PropTypes.shape({
          type: require("react").PropTypes.string.isRequired,
          payload: require("react").PropTypes.shape({}),
          meta: require("react").PropTypes.shape({
            success: require("react").PropTypes.bool.isRequired,
            completed: require("react").PropTypes.bool.isRequired
          }).isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  })
});
Object.defineProperty(module.exports, "babelPluginFlowReactPropTypes_proptype_OfflineState", {
  value: require("react").PropTypes.shape({
    lastTransaction: require("react").PropTypes.number.isRequired,
    online: require("react").PropTypes.bool.isRequired,
    outbox: require("react").PropTypes.any.isRequired,
    receipts: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
      message: require("react").PropTypes.shape({
        effect: require("react").PropTypes.shape({}).isRequired,
        commit: require("react").PropTypes.shape({
          type: require("react").PropTypes.string.isRequired,
          payload: require("react").PropTypes.shape({}),
          meta: require("react").PropTypes.shape({
            success: require("react").PropTypes.bool.isRequired,
            completed: require("react").PropTypes.bool.isRequired
          }).isRequired
        }).isRequired,
        rollback: require("react").PropTypes.shape({
          type: require("react").PropTypes.string.isRequired,
          payload: require("react").PropTypes.shape({}),
          meta: require("react").PropTypes.shape({
            success: require("react").PropTypes.bool.isRequired,
            completed: require("react").PropTypes.bool.isRequired
          }).isRequired
        }).isRequired
      }).isRequired,
      success: require("react").PropTypes.bool.isRequired,
      result: require("react").PropTypes.shape({}).isRequired
    })).isRequired,
    retryCount: require("react").PropTypes.number.isRequired,
    retryToken: require("react").PropTypes.number.isRequired,
    retryScheduled: require("react").PropTypes.bool.isRequired
  })
});
Object.defineProperty(module.exports, "babelPluginFlowReactPropTypes_proptype_AppState", {
  value: require("react").PropTypes.shape({
    offline: require("react").PropTypes.shape({
      lastTransaction: require("react").PropTypes.number.isRequired,
      online: require("react").PropTypes.bool.isRequired,
      outbox: require("react").PropTypes.any.isRequired,
      receipts: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        message: require("react").PropTypes.shape({
          effect: require("react").PropTypes.shape({}).isRequired,
          commit: require("react").PropTypes.shape({
            type: require("react").PropTypes.string.isRequired,
            payload: require("react").PropTypes.shape({}),
            meta: require("react").PropTypes.shape({
              success: require("react").PropTypes.bool.isRequired,
              completed: require("react").PropTypes.bool.isRequired
            }).isRequired
          }).isRequired,
          rollback: require("react").PropTypes.shape({
            type: require("react").PropTypes.string.isRequired,
            payload: require("react").PropTypes.shape({}),
            meta: require("react").PropTypes.shape({
              success: require("react").PropTypes.bool.isRequired,
              completed: require("react").PropTypes.bool.isRequired
            }).isRequired
          }).isRequired
        }).isRequired,
        success: require("react").PropTypes.bool.isRequired,
        result: require("react").PropTypes.shape({}).isRequired
      })).isRequired,
      retryCount: require("react").PropTypes.number.isRequired,
      retryToken: require("react").PropTypes.number.isRequired,
      retryScheduled: require("react").PropTypes.bool.isRequired
    }).isRequired
  })
});
Object.defineProperty(module.exports, "babelPluginFlowReactPropTypes_proptype_Config", {
  value: require("react").PropTypes.shape({
    batch: require("react").PropTypes.func.isRequired,
    detectNetwork: require("react").PropTypes.func.isRequired,
    persist: require("react").PropTypes.func.isRequired,
    effect: require("react").PropTypes.func.isRequired,
    retry: require("react").PropTypes.func.isRequired,
    discard: require("react").PropTypes.func.isRequired,
    persistOptions: require("react").PropTypes.shape({}).isRequired
  })
});