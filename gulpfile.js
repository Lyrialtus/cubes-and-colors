const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', () =>
    gulp.src('cubes.js')
        .pipe(babel({
            presets: ['es2015'],
            plugins: ['transform-es2015-modules-amd'],
          }))
        .pipe(gulp.dest('dist'))
);

gulp.task('index', () =>
    gulp.src('node_modules/three-trackballcontrols/index.js')
        .pipe(babel({
            plugins: ['transform-es2015-modules-amd'],
          }))
        .pipe(gulp.dest('node_modules/three-trackballcontrols'))
);
