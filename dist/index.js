
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./redux-offline.cjs.production.min.js')
} else {
  module.exports = require('./redux-offline.cjs.development.js')
}
