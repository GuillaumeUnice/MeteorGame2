var gulp = require('gulp');
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var mocha = require('gulp-mocha');
var webpack = require('webpack-stream');


gulp.task('build', ['build-client', 'build-server']);

gulp.task('build-client', function () {
    return gulp.src(['src/client/js/app.js'])

        .pipe(gulp.dest('src/client/js/'));
});

gulp.task('build-server', function () {
    return gulp.src(['src/server/**/*.*', 'src/server/**/*.js'])

        .pipe(gulp.dest('src/server/'));
});

gulp.task('test', ['lint'], function () {
    gulp.src(['test/**/*.js'])
        .pipe(mocha());
});

gulp.task('lint', function () {
    return gulp.src(['**/*.js', '!node_modules/**/*.js', '!bin/**/*.js'])
        .pipe(jshint({
            esnext: true
        }))
        .pipe(jshint.reporter('default', {verbose: true}))
        .pipe(jshint.reporter('fail'));
});


gulp.task('move-client', function () {
    return gulp.src(['src/client/**/*.*', '!client/js/*.js'])
        .pipe(gulp.dest('./bin/client/'));
});


gulp.task('watch', ['build'], function () {
    gulp.watch(['src/client/**/*.*'], ['build-client']);
    gulp.watch(['src/server/*.*', 'src/server/**/*.js'], ['build-server']);
    gulp.start('run-only');
});

gulp.task('run', ['build'], function () {
    nodemon({
        delay: 10,
        script: './server/server.js',
        cwd: "./src/",
        args: ["config.json"],
        ext: 'html js css'
    })
        .on('restart', function () {
            util.log('server restarted!');
        });
});

gulp.task('run-only', function () {
    nodemon({
        delay: 10,
        script: './server/server.js',
        cwd: "./src/",
        args: ["config.json"],
        ext: 'html js css'
    })
        .on('restart', function () {
            util.log('server restarted!');
        });
});

gulp.task('default', ['run']);