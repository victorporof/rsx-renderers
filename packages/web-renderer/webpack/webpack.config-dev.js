// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

import webpack from 'webpack';

import baseConfig from './webpack.config';

export default {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: 'renderer.js',
    pathinfo: true,
  },
  devtool: 'eval-cheap-module-source-map',
  plugins: [
    ...baseConfig.plugins,
    new webpack.NamedModulesPlugin(),
  ],
};
