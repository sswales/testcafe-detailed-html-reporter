var gulp = require('gulp');
var eslint = require('gulp-eslint');
var babel = require('gulp-babel');
var del = require('del');

gulp.task('clean', (cb) => {
  del('lib', cb);
});

gulp.task('lint', () => {
  return gulp
    .src(['src/**/*.js', 'test/**/*.js', 'Gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', async () => {
  console.log('test');
});

gulp.task('build', () => {
  return gulp.src('src/**/*.js').pipe(babel()).pipe(gulp.dest('lib'));
});
