/**
 * Gulp build script
 */

var ace_deps = [
  "ace.js",
  "mode-markdown.js",
  "theme-monokai.js"
];

var style_deps = [
  "github-markdown.less",
  "bootstrap.less"
];

var gulp = require("gulp")
    plug = require("gulp-load-plugins")();

ace_deps = ace_deps.map(function (file) {
  return "ace/build/src-min-noconflict/" + file;
});
style_deps = style_deps.map(function (file) {
  return "src/style/" + file;
});

gulp.task("clean", function () {
  return gulp.src("build", {read: false})
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

gulp.task("style", function () {
  return gulp.src(style_deps)
    .pipe(plug.less())
    .pipe(plug.minifyCss())
    .pipe(plug.concat("mace.css"))
    .pipe(gulp.dest("build"));
});

gulp.task("fonts", function () {
  return gulp.src("src/fonts/*")
    .pipe(gulp.dest("build/fonts"));
});

gulp.task("concat", ["mace", "ace", "marked", "style", "fonts"], function () {
  return gulp.src(["build/ace.js", "build/marked.js", "build/mace.js"])
    .pipe(plug.concat("mace.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("default", ["clean", "concat"], function () {
  return gulp.src(["build/ace.js", "build/marked.js"], {read: false})
    .pipe(plug.clean());
});
