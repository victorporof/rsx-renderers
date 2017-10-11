// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

import fs from 'fs-extra';
import del from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import webpack from 'webpack';

import devConfig from './webpack/webpack.config-dev';
import prodConfig from './webpack/webpack.config-prod';

const WEBPACK_STATS_OPTIONS = {
  colors: true,
  warnings: false,
};

gulp.task('clean', () =>
  del(['./dist']));

gulp.task('build:babel', () =>
  gulp.src('./src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel(fs.readJsonSync('.babelrc')))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/modules')));

gulp.task('build:webpack', () => new Promise((resolve, reject) =>
  webpack(process.env.NODE_ENV !== 'development' ? prodConfig : devConfig, (err, stats) => {
    if (err) { reject(err); return; }
    if (stats) { console.log(stats.toString(WEBPACK_STATS_OPTIONS)); }
    resolve();
  })));

gulp.task('build', gulp.series(
  'clean',
  'build:babel',
  'build:webpack',
));
