var gulp        = require('gulp');
var rename      = require('gulp-rename');
var vinylPaths  = require('vinyl-paths');
var del         = require('del');
var plumber     = require('gulp-plumber');
var browserSync = require('browser-sync').create();
var path        = require('path');
var cache       = require('gulp-cached');
var sass        = require('gulp-sass');
var tslint      = require('gulp-tslint');

var paths = {
    src: {
        ts   : 'src/**/*.ts',
        tpl  : 'src/**/*.html',
        sass : 'src/**/*.scss'
    },
    destDir: 'dest/',
    dest: {
        js   : 'dest/**/*.js',
        tpl  : 'dest/**/*.html',
        sass : 'dest/**/*.scss'
    }
};

gulp.task('clean', function() {
    return gulp.src([paths.destDir])
      .pipe(vinylPaths(del));
});

gulp.task('lint', function() {
    return gulp.src([paths.src.ts])
      .pipe(tslint())
      .pipe(tslint.report('verbose'));
});

gulp.task('sass', function() {
    gulp.src(paths.src.sass)
      .pipe(sass())
      .pipe(rename({
          extname: '.css'
      }))
      .pipe(gulp.dest(paths.dest.sass));
});

gulp.task('move', function() {
    return gulp.src([
        'src/**/*',
        '!' + paths.src.sass
    ])
    .pipe(cache('move'))
    .pipe(gulp.dest(paths.destDir))
    .pipe(browserSync.reload({
        stream: true
    }));
});

gulp.task('compile', ['sass', 'move']);

gulp.task('serve', ['compile'], function(done) {
    browserSync.init({
        open: false,
        notify: false,
        browser: 'google chrome',
        port: 9000,
        server: {
            baseDir: ['.'],
            middleware: function(req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            }
        }
    }, done);
});

gulp.task('watch', ['serve'], function() {
    var watcher = gulp.watch([paths.src.ts, paths.src.tpl, paths.src.sass], {interval: 500}, ['compile']);
    watcher.on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('default', ['watch']);
