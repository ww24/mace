/**
 * Gulp build script
 */

var ace_deps = [
  "ace.js",
  "mode-markdown.js",
  "theme-monokai.js"
];

var gulp = require("gulp")
    plug = require("gulp-load-plugins")();

ace_deps = ace_deps.map(function (file) {
  return "ace/build/src-min-noconflict/" + file;
});

gulp.task("clean", function () {
  return gulp.src("build/*.js", {read: false})
    .pipe(plug.clean());
});

gulp.task("mace", function () {
  return gulp.src("src/*.coffee")
    .pipe(plug.coffee())
    .pipe(plug.uglify({preserveComments: "some"}))
    .pipe(gulp.dest("build"));
});

gulp.task("ace", function () {
  return gulp.src(ace_deps)
    .pipe(plug.insert.append(";"))
    .pipe(plug.concat("ace.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("marked", function () {
  return gulp.src("marked/lib/marked.js")
    .pipe(plug.uglify({preserveComments: "some"}))
    .pipe(gulp.dest("build"));
});

gulp.task("github-md-css", function () {
  return gulp.src("github-markdown-css/github-markdown.css")
    .pipe(plug.minifyCss())
    .pipe(gulp.dest("build"));
});

gulp.task("concat", ["mace", "ace", "marked", "github-md-css"], function () {
  return gulp.src(["build/ace.js", "build/marked.js", "build/mace.js"])
    .pipe(plug.concat("mace.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("default", ["clean", "concat"], function () {
  return gulp.src(["build/ace.js", "build/marked.js"], {read: false})
    .pipe(plug.clean());
});
