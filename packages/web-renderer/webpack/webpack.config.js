// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

import path from 'path';

export default {
  entry: [
    path.join(__dirname, '..', 'src', 'lib.js'),
  ],
  output: {
    path: path.join(__dirname, '..', 'dist', 'bundle'),
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
      }],
    }],
  },
  plugins: [],
};
