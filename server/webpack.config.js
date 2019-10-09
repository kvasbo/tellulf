const path = require('path');

module.exports = {
  entry: './build/index.js',
  mode: 'production',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  }
};