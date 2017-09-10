module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb-base'],
  globals: {
    Promise: true
  },
  env: {
    node: true
  },
  rules: {
    'comma-dangle': 'off',
    'import/prefer-default-export': ['warn'],
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'function-paren-newline': ['error', 'consistent']
  }
};
