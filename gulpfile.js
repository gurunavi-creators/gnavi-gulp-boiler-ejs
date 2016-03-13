/**
 * gulp-boiler
 * 
 * ** 開発開始手順
 * 
 * $ npm i
 * $ npm i gulp.spritesmith
 * $ gulp sprite
 * 
 * 
 * ** 開発開始 with clean & watchコマンド
 * 
 * $ gulp start
 * 
 * ** spriteコマンド
 * 
 * $ gulp sprite
 * 
 * ** iamge optimコマンド
 * 
 * $ gulp optim
 * 
 * ** jshintコマンド
 * 
 * $ gulp test
 * 
 * ** dist、tmp削除コマンド
 * 
 * $ gulp clean
 * 
 * ---------------------------------------------------------------------- */

/*
 * init package
 */
var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var plumber = require('gulp-plumber');
var livereload = require('gulp-livereload');
var rename = require('gulp-rename');
var size = require('gulp-size');


/*
 * path
 */
var path = {
  src: 'src/',
  dist: 'dist/',
  tmp: 'tmp/',
  html_src: 'src/ejs/',
  scss_src: 'src/scss/',
  js_src: 'src/js/',
  img_src: 'src/img/',
  sprite_src: 'src/sprite/'
};


/*
 * clean
 */
var clean = require('del');
gulp.task('clean', function () {
  clean(path.tmp);
  clean(path.dist);
});


/*
 * sprite
 */
var spritesmith = require('gulp.spritesmith');
gulp.task('sprite', function () {
  var spriteData = gulp.src(path.sprite_src + 'sprite-sample/*.png')
  .pipe(spritesmith({
    imgName: 'sprite-sample.png',
    cssName: 'sprite-sample.scss',
    imgPath: '../img/sprite-sample.png',
    cssFormat: 'scss',
    padding: 5
  }));
  spriteData.img.pipe(gulp.dest(path.img_src));
  spriteData.css.pipe(gulp.dest(path.scss_src + 'all/module/'))
    .pipe(size({title:'size : sprite'}));
});


/*
 * image optim
 */
var imageOptim = require('gulp-imageoptim');
gulp.task('imageOptim', function() {
  return gulp.src(path.img_src + '**/*')
    .pipe(imageOptim.optimize())
    .pipe(gulp.dest(path.img_src));
});


/*
 * css
 */
// sass
var sass = require('gulp-sass');
gulp.task('sass', function () {
  gulp.src(path.scss_src + 'all/import.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(gulp.dest(path.tmp + 'css/all/'))
    .pipe(rename('all.css'))
    .pipe(gulp.dest(path.tmp + 'css/'));
});

// autoprefixer
var autoprefixer = require('gulp-autoprefixer');
require('es6-promise').polyfill();
gulp.task('autoprefixer', function () {
  gulp.src(path.tmp + 'css/all.css')
    .pipe(plumber())
    .pipe(autoprefixer({
      browsers: ['last 2 version'],
      cascade: false
    }))
    .pipe(gulp.dest(path.tmp + 'css/'));
});

// csscomb
var csscomb = require('gulp-csscomb');
gulp.task('csscomb', function () {
  gulp.src(path.tmp + 'css/all.css')
    .pipe(plumber())
    .pipe(csscomb())
    .pipe(gulp.dest(path.tmp + 'css/'));
});

// csso
var csso = require('gulp-csso');
gulp.task('csso', function () {
  gulp.src(path.tmp + 'css/all.css')
    .pipe(plumber())
    .pipe(csso())
    .pipe(gulp.dest(path.dist + 'css/'))
    .pipe(livereload())
    .pipe(size({title:'size : css'}));
});


/*
 * js
 */
// concat
var concat = require('gulp-concat');
gulp.task('concat', function () {
  // js
  return gulp.src(path.js_src + 'all/*.js')
    .pipe(plumber())
    .pipe(concat('all.js'))
    .pipe(gulp.dest(path.tmp + 'js/'));
});

// uglify
var uglify = require('gulp-uglify');
gulp.task('uglify', function () {
  return gulp.src(path.tmp + 'js/*.js')
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest(path.dist + 'js/'))
    .pipe(livereload())
    .pipe(size({title:'size : js'}));
});

// jshint
var jshint = require('gulp-jshint');
gulp.task('jshint', function () {
  return gulp.src(path.js_src + 'all/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
gulp.task('eslint', function () {
  return gulp.src(path.js_src + 'all/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


/*
 * html
 */
// ejs
var ejs = require('gulp-ejs');
var minifyejs = require('gulp-minify-ejs');
gulp.task('ejs', function() {
  gulp.src(
      [
        path.html_src + 'html/**/*.ejs',
        '!' + path.html_src + 'html/include/**/*.ejs'
      ]
    )
    .pipe(plumber())
    .pipe(ejs(
      {
        data:{
          default: require('./' + path.html_src + 'data/common/default.json'),
          nav: require('./' + path.html_src + 'data/common/nav.json'),
          sample: require('./' + path.html_src + 'data/module/sample.json')
        }
      },
      {ext: '.html'}
    ))
    // minify
    //.pipe(minifyejs())
    .pipe(gulp.dest(path.dist + '/'))
    .pipe(livereload())
    .pipe(size({title:'size : html'}));
});


/*
 * copy
 */
gulp.task('copy', function () {
  return gulp.src(
    [
      path.js_src + 'lib.js',
      path.img_src + '**/*'
    ],
    {base: path.src}
  )
  .pipe(plumber())
  .pipe(gulp.dest(path.dist))
  .pipe(livereload())
  .pipe(size({title:'size : copy'}));
});


/*
 * watch
 */
gulp.task('watch', function () {
  gulpSequence('build')();
  livereload.listen();
  gulp.watch(path.scss_src + '**/*.scss', ['build:css']);
  gulp.watch(path.js_src + '**/*.js', ['build:js']);
  gulp.watch(path.src + 'ejs/**/*', ['build:html']);
  gulp.watch(path.img_src + '**/*', ['local']);
  gulp.watch('gulpfile.js', ['local']);
});


/*
 * task manage
 */
// build:css
gulp.task('build:css', function () {
  gulpSequence('sass', 'autoprefixer', 'csscomb', 'csso')();
});

// build:js
gulp.task('build:js', function () {
  gulpSequence('concat', 'uglify', 'jshint')();
});

// build:html
gulp.task('build:html', function () {
  gulpSequence('ejs')();
});

// build:copy
gulp.task('build:copy', function () {
  gulpSequence('copy')();
});

// image optim
gulp.task('optim', function () {
  gulpSequence('imageOptim')();
});

// test
gulp.task('test', function () {
  gulpSequence('jshint', 'eslint')();
});

// build
gulp.task('build', function () {
  gulpSequence('build:css', 'build:js', 'build:html', 'build:copy')();
});

// default
gulp.task('default', function () {
  gulpSequence('build')();
});


/*
 * option task
 */
// start
gulp.task('start', function () {
  gulpSequence('clean', 'build', 'watch')();
});

// local
gulp.task('local', function () {
  gulpSequence('build')();
});

// dev
gulp.task('dev', function () {
  gulpSequence('build')();
});