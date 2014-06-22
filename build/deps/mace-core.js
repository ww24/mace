
/*!
 * Mace 0.0.1
 * copyright: Takenori Nakagawa
 * license: MIT
 */

(function() {
  "use strict";
  var Mace;

  Mace = (function() {
    function Mace(editor, preview, options) {
      var mace;
      this.editor = editor;
      this.preview = preview != null ? preview : null;
      if (options == null) {
        options = {};
      }
      mace = this;
      this.ace = ace.edit(this.editor);
      this.ace.getSession().setMode("ace/mode/markdown");
      this.ace.setTheme("ace/theme/monokai");
      marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
      });
      if (this.preview !== null) {
        this._render();
        this.ace.on("change", (function(_this) {
          return function() {
            return _this._render();
          };
        })(this));
      }
      Object.defineProperty(this, "value", {
        get: function() {
          return this.ace.getValue();
        }
      });
      Object.defineProperty(this, "font_size", {
        get: function() {
          return this.ace.getFontSize();
        },
        set: function(size) {
          return this.ace.setFontSize(size);
        }
      });
    }

    Mace.prototype._render = function() {
      var markdown;
      markdown = this.ace.getValue();
      return marked(markdown, (function(_this) {
        return function(err, html) {
          if (err != null) {
            console.error(err);
          }
          return _this.preview.innerHTML = html;
        };
      })(this));
    };

    Mace.prototype.indent = function(count) {
      var i, _i;
      if (count == null) {
        count = 1;
      }
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        this.ace.indent();
      }
      return this.ace.focus();
    };

    Mace.prototype.outdent = function(count) {
      var i, _i;
      if (count == null) {
        count = 1;
      }
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        this.ace.blockOutdent();
      }
      return this.ace.focus();
    };

    Mace.prototype.heading = function(count) {
      var Range, level, lv, p, pos, range, row, row_length, text, _i, _j, _ref, _ref1, _ref2;
      if (count == null) {
        count = 1;
      }
      if (count < 0 || count > 6) {
        throw new RangeError;
      }
      pos = this.ace.getCursorPosition();
      range = this.ace.selection.getRange();
      this.ace.selection.clearSelection();
      if (range.end.column === 0 && range.end.row - range.start.row === 1) {
        range.end.row--;
      }
      row_length = range.end.row - range.start.row;
      Range = range.constructor;
      for (row = _i = _ref = range.start.row, _ref1 = range.end.row; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
        this.ace.moveCursorTo(row, 0);
        this.ace.navigateLineEnd();
        p = this.ace.getCursorPosition();
        this.ace.selection.addRange(new Range(p.row, 0, p.row, p.column));
        text = this.ace.getCopyText();
        this.ace.selection.clearSelection();
        this.ace.moveCursorTo(row, 0);
        level = ((_ref2 = text.match(/^#+/i)) != null ? _ref2[0].length : void 0) || 0;
        if (level === count) {
          continue;
        }
        for (lv = _j = level; level <= count ? _j < count : _j > count; lv = level <= count ? ++_j : --_j) {
          if (level < count) {
            this.ace.insert("#");
          } else {
            this.ace.remove("right");
          }
        }
      }
      this.ace.moveCursorTo(pos.row, pos.column + count);
      return this.ace.focus();
    };

    Mace.prototype.link = function(href, link_text, title, is_image) {
      var image, selected_text;
      if (href == null) {
        href = "./";
      }
      if (title == null) {
        title = "";
      }
      if (is_image == null) {
        is_image = false;
      }
      selected_text = this.ace.getCopyText().split("\n").join("");
      link_text = link_text || selected_text || "link";
      if (title.length > 0) {
        title = " \"" + title + "\"";
      }
      image = ["", "!"][+is_image];
      this.ace.insert("" + image + "[" + link_text + "](" + href + title + ")");
      return this.ace.focus();
    };

    Mace.prototype.clear = function(force) {
      if (force == null) {
        force = false;
      }
      if (force) {
        return this.ace.setValue("");
      } else {
        return this.ace.removeLines();
      }
    };

    return Mace;

  })();

  this.Mace = Mace;

}).call(this);
