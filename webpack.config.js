const path = require('path')
const fs = require('fs')
const dirs = fs.readdirSync('children-pages-src')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const entry = {}
const plugins = []
dirs.forEach((dir) => {
  entry[dir] = path.resolve(__dirname, './children-pages-src', `${dir}/index.js`)
  plugins.push(new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './children-pages-src', `${dir}/index.html`),
    filename: `${dir}.html`,
    chunks: [`${dir}`]
  }))
})

module.exports = {
  target: 'electron-main',
  entry,
  output: {
    path: path.resolve(__dirname, './children-pages-build'),
    filename: '[name].js'
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  },
  mode: 'production',
  plugins,
  node: {
    __dirname: false
  }
}