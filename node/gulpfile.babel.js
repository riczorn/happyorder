

const distributionFolder = 'dist';
// const gulp = require('gulp');
const gulp = require('gulp');
const ts = require('gulp-typescript');

// pull in the project Typescript config
const tsProject = ts.createProject('tsconfig.json');

//task to be run when the watcher detects changes
function scripts() {

  return tsProject.src()
    .pipe(ts({

    }))
    .pipe(gulp.dest(distributionFolder));

  // const tsResult = tsProject.src()
  //   .pipe(tsProject());
  // return tsResult.js.pipe(dest(distributionFolder));
}

//set up a watcher to watch over changes
function watch() {
  gulp.watch('**/*.ts', ['scripts']);
}

// exports.scripts = scripts;
// exports.watch = watch;
// exports.default = scripts;

gulp.task('watch', watch);
gulp.task('scripts', scripts);
gulp.task('default', scripts);