module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb-base', 'plugin:flowtype/recommended', 'prettier'],
  plugins: ['flowtype', 'prettier'],
  globals: {
    Promise: true,
    document: false // https://stackoverflow.com/a/41922950/3481005
  },
  env: {
    jest: true,  // https://stackoverflow.com/a/40265356/586382
    browser: true, // https://stackoverflow.com/a/41922950/3481005
    node: true
  },
  rules: {
    'comma-dangle': 'off',
    'import/prefer-default-export': 0,
    'function-paren-newline': ['error', 'consistent'],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        parser: 'flow'
      }
    ],
    'flowtype/space-after-type-colon': 0
  }
};
