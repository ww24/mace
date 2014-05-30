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

var gulp = require("gulp"),
    plug = require("gulp-load-plugins")();

ace_deps = ace_deps.map(function (file) {
  return "ace/build/src-min-noconflict/" + file;
});
style_deps = style_deps.map(function (file) {
  return "src/style/" + file;
});

gulp.task("clean", function () {
  return gulp.src(["build", "coverage"], {read: false})
    .pipe(plug.clean());
});

gulp.task("mace", function () {
  return gulp.src("src/*.coffee")
    .pipe(plug.coffee())
    .pipe(plug.concat("mace-core.js"))
    .pipe(gulp.dest("build/depend"))
    .pipe(plug.uglify({preserveComments: "some"}))
    .pipe(plug.concat("mace-core.min.js"))
    .pipe(gulp.dest("build/depend"));
});

gulp.task("ace", function () {
  return gulp.src(ace_deps)
    .pipe(plug.insert.append(";"))
    .pipe(plug.concat("ace.min.js"))
    .pipe(gulp.dest("build/depend"));
});

gulp.task("marked", function () {
  return gulp.src("src/vendor/marked.js")
    .pipe(plug.uglify({preserveComments: "some"}))
    .pipe(plug.concat("marked.min.js"))
    .pipe(gulp.dest("build/depend"));
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
  return gulp.src("build/depend/*.min.js")
    .pipe(plug.concat("mace.min.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("default", ["clean", "concat"]);
