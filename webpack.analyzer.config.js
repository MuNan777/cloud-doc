const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const config = require('./webpack.config')

config.plugins.push(new BundleAnalyzerPlugin())
config.mode = 'production'

module.exports = config