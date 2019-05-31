const path = require('path');

module.exports = {
  mode: 'production',
  entry: './client/js/index.js',

  output: {
    path: path.join(__dirname, 'public/js'),
    filename: 'index.js'
  },

  devtool: 'source-map',

  resolve: {
    modules: ['client/lib', 'node_modules'],
    extensions: ['.js']
  }
};
