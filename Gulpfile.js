'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const svgmin = require('gulp-svgmin');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const merge = require('merge-stream');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const pump = require('pump');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const babel = require('gulp-babel');

// Compile SCSS and merge with requried Magic CSS library componets
gulp.task('css', () => {
    let sassStream;
    let mdlStream;

    // Compile SCSS
    sassStream = gulp.src('./dev/scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer());

    // Material Icons fonts
    mdlStream = gulp.src([
        './node_modules/material-design-icons/iconfont/material-icons.css'
    ]);

    // Merge the two streams and concat in to one CSS file
    return merge(mdlStream, sassStream)
        .pipe(sourcemaps.init())
        .pipe(concat('app.css'))
        .pipe(cleanCss())
        .pipe(sourcemaps.write('', {addComment: false}))
        .pipe(gulp.dest('./public/css'));
});

// Move Material Icon Fonts
gulp.task('iconfont', () => {
    gulp.src('./node_modules/material-design-icons/iconfont/MaterialIcons-Regular.*')
        .pipe(gulp.dest('./public/css'));
});

// Image minification
gulp.task('img', () => {
    return gulp.src('./dev/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./public/img/'));
});

// SVG minification
gulp.task('svg', () => {
    return gulp.src('./dev/svg/**/*.svg')
        .pipe(svgmin({
            plugins: [
                {removeDoctype: true},
                {removeComments: true}
            ]
        }))
        .pipe(gulp.dest('./public/svg'));
});

// JSHint/Lint
gulp.task('hint', () => {
    return gulp.src('./dev/js/*.js')
        .pipe(jshint({esnext: true}))
        .pipe(jshint.reporter(stylish))
});

// Compress & Concatenate JS
gulp.task('compress', (cb) => {
    pump([
            gulp.src([
                './node_modules/material-design-lite/material.js',
                './dev/js/*.js'
            ]),
            sourcemaps.init(),
            babel({presets: ['es2015']}),
            concat('app.js'),
            uglify(),
            sourcemaps.write('', {addComment: false}),
            gulp.dest('./public/js')
        ],
        cb
    );
});

// Watch
gulp.task('watch', () => {
    gulp.watch('./dev/scss/**/*.scss', ['css']);
    gulp.watch('./dev/img/**/*.*', ['img']);
    gulp.watch('./dev/svg/**/*.svg', ['svg']);
    gulp.watch('./dev/js/**/*.js', ['js']);
});

// Default task
gulp.task('default', ['css', 'iconfont', 'img', 'svg', 'js', 'watch']);
gulp.task('js', ['hint', 'compress']);
