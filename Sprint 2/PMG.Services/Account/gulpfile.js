var gulp = require('gulp');
var zip = require('gulp-zip');
var del = require('del');
var install = require('gulp-install');
var runSequence = require('run-sequence');

gulp.task('clean', function () {
    return del(['./dist', './package.zip']);
});

gulp.task('js', function () {
    return gulp.src('index.js')
        .pipe(gulp.dest('dist/'));
});

gulp.task('node-mods', function () {
    return gulp.src('./package.json')
        .pipe(gulp.dest('dist/'))
        .pipe(install({
            production: true
        }));
});

gulp.task('zip', function () {
    return gulp.src(['dist/**/*', '!dist/package.json'], {nodir: true})
        .pipe(zip('package.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('package', function (callback) {
    return runSequence(
        ['clean'], ['js', 'node-mods'], ['zip'],
        callback
    );
});
