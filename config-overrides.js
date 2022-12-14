const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const {
  override,
  addWebpackPlugin,
  setWebpackTarget,
} = require("customize-cra");
module.exports = {
  webpack: override(
    setWebpackTarget('electron-main'),
    addWebpackPlugin(new NodePolyfillPlugin()),
  )
}