const gulp = require('gulp');
let sass = require('gulp-sass');
sass.compiler = require('node-sass');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer'); // автоматически добавляет вендорные префиксы к CSS свойствам (req .browserslistrc)
const cssvariables = require('postcss-css-variables');
const calc = require('postcss-calc');
const sourcemaps = require('gulp-sourcemaps'); // указывает src файл js/css для инспектора браузров
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uncss = require('gulp-uncss'); // уберет неиспользуемые css классы
// minify js/css
const uglify = require('gulp-uglify-es').default; // сжатие js es6 кода
const cleanCSS = require('gulp-clean-css'); // сжатие CSS кода
const imagemin = require('gulp-imagemin');
// Пути
const ROOT = "./";
const BUILD = "dist/"
const SRC = "src/"

const PATH = {
    // готовые файлы после сборки
    build: {
        css: ROOT + BUILD + "css",
        js: ROOT + BUILD + "js",
        img: ROOT + BUILD + "img",
    },
    // пути исходных файлов
    src: {
        css: ROOT + SRC + "scss/**/*.scss",
        js: ROOT + SRC + "js/**/*.js",
        img: ROOT + SRC + "img/*",
        html: BUILD + "*.html"
    }
}
// \ Пути

gulp.task('build-dev:sass', sassCallback);

gulp.task('build:sass', () => {
    return sassCallback(true);
});

gulp.task('build-dev:js', jsCallback);

gulp.task('build:js', () => {
    return jsCallback(true);
});

gulp.task("build:img", () => {
    return gulp.src(PATH.src.img)
        .pipe(imagemin({
            verbose: true
        }))
        .pipe(gulp.dest(PATH.build.img));
});

gulp.task("build", gulp.series(['build:sass', 'build:js', "build:img"]));
gulp.task("build-dev", gulp.series(['build-dev:sass', 'build-dev:js', "build:img"]));

gulp.task('browserSync', gulp.series((done) => {
    browserSync.init({
        watch: true,
        server: BUILD
        // notify: false
    })
    done();
}));

gulp.task('watch', gulp.series(['browserSync', 'build'], () => {
    gulp.watch(PATH.src.html, gulp.series(reload));
    gulp.watch(PATH.src.css, gulp.series(['build:sass']));
    gulp.watch(PATH.src.js, gulp.series(['build:js']));
    gulp.watch(PATH.src.img, gulp.series(['build:img']));
}));

gulp.task('watch-dev', gulp.series(['browserSync', 'build-dev'], () => {
    gulp.watch(PATH.src.html, gulp.series(reload));
    gulp.watch(PATH.src.css, gulp.series(['build-dev:sass']));
    gulp.watch(PATH.src.js, gulp.series(['build-dev:js']));
    gulp.watch(PATH.src.img, gulp.series(['build-dev:img']));
}));

function sassCallback(prod = false) {
    if (prod) {
        return gulp.src(PATH.src.css)
            .pipe(sass().on('error', sass.logError))
            .pipe(postcss([autoprefixer(), cssvariables({
                preserve: true
            }), calc()]))
            .pipe(concat('style.min.css'))
            .pipe(uncss({
                html: [PATH.src.html /*, ignore: [/\.nav__menu-active/] игнор классов */ ]
            }))
            .pipe(cleanCSS())
            .pipe(gulp.dest(PATH.build.css));
    }
    return gulp.src(PATH.src.css)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(postcss([autoprefixer(), cssvariables({
            preserve: true
        }), calc()]))
        .pipe(concat('style.css'))
        .pipe(uncss({
            html: [PATH.src.html /*, ignore: [/\.nav__menu-active/] игнор классов */ ]
        }))
        .pipe(gulp.dest(PATH.build.css))
        .pipe(rename(function (path) {
            path.basename += ".min";
        }))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(PATH.build.css));
}

function jsCallback(prod = false) {
    if (prod) {
        return gulp.src(PATH.src.js)
            .pipe(concat('scripts.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest(PATH.build.js))
    }
    return gulp.src(PATH.src.js)
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(PATH.build.js))
        .pipe(rename(function (path) {
            path.basename += ".min";
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(PATH.build.js));
}

function reload(done) {
    browserSync.reload();
    done();
}