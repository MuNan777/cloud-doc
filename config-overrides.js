const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
// const CompressionPlugin = require("compression-webpack-plugin");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const closedMap = config => {
  config.target = 'electron-renderer'
  config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : false
  config.plugins.push(...[new NodePolyfillPlugin(), /* new CompressionPlugin(), new BundleAnalyzerPlugin() */])
  return config;
};

const {
  override,
} = require("customize-cra");

module.exports = {
  webpack: override(
    closedMap
  ),
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);

      // 删除所有旧的配置项
      delete config.onAfterSetupMiddleware;
      delete config.onBeforeSetupMiddleware;
      delete config.https;

      // 使用新的 setupMiddlewares
      config.setupMiddlewares = (middlewares, devServer) => {
        return middlewares;
      };

      // 如果需要 HTTPS，使用 server 配置
      // config.server = 'https';

      // 如果只需要 HTTP
      config.server = 'http';

      console.log('DevServer config:', config); // 调试用，查看最终配置

      return config;
    };
  }
}