module.exports = {
  rollup(config) {
    config.external = ['@react-native-community/netinfo', 'react-native'];
    return config;
  },
};
