/**
 * Gulp build script
 */

var gulp = require("gulp"),
    plug = require("gulp-load-plugins")(),
    del = require("del"),
    config = require("config");

var ace_deps = [
  "ace.js",
  "mode-markdown.js"
];

// set ace theme
ace_deps.push("theme-" + config.ace.theme + ".js");

ace_deps = ace_deps.map(function (file) {
  return "ace/build/src-noconflict/" + file;
});

gulp.task("clean", function (done) {
  del(["build/*", "coverage/*"], done);
});

gulp.task("mace", function () {
  return gulp.src("src/*.coffee")
    .pipe(plug.replace("((\"monokai\"))", "\"" + config.ace.theme + "\""))
    .pipe(plug.coffee())
    .pipe(plug.concat("mace-core.js"))
    .pipe(gulp.dest("build/deps"))
    .pipe(plug.uglify({preserveComments: "some"}))
    .pipe(plug.concat("mace-core.min.js"))
    .pipe(gulp.dest("build/deps"));
});

gulp.task("ace", function () {
  return gulp.src(ace_deps)
    .pipe(plug.insert.append(";"))
    .pipe(plug.uglify({preserveComments: function (node, comment) {
      // check license comment
      return !!~ comment.value.indexOf("license");
    }}))
    .pipe(plug.concat("ace.min.js"))
    .pipe(gulp.dest("build/deps"));
});

gulp.task("marked", function () {
  return gulp.src("node_modules/marked/lib/marked.js")
    .pipe(plug.uglify({preserveComments: function (node, comment) {
      // check license comment
      return !!~ comment.value.indexOf("Licensed");
    }}))
    .pipe(plug.concat("marked.min.js"))
    .pipe(gulp.dest("build/deps"));
});

gulp.task("concat", ["mace", "ace", "marked"], function () {
  return gulp.src("build/deps/*.min.js")
    .pipe(plug.concat("mace.min.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("default", ["clean"], function () {
  gulp.start("concat");
});
