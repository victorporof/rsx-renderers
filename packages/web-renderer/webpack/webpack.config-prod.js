// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

import baseConfig from './webpack.config';

export default {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: 'renderer.min.js',
  },
  devtool: 'source-map',
};
