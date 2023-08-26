const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = function override(config, env) {
  if (!config.plugins) {
    config.plugins = [];
  }
  config.plugins.push(
    new NodePolyfillPlugin({
      excludeAliases: ["console"],
    })
  );
  config.resolve.alias = {
    "react/jsx-runtime.js": "react/jsx-runtime",
    "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",
  };
  return config;
};
