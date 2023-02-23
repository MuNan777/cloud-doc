const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
// const CompressionPlugin = require("compression-webpack-plugin");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const closedMap = config => {
  config.target = 'electron-main'
  console.log(config)
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
  )
}