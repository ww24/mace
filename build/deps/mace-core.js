
/*!
 * Mace 0.1.2
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
      this.Ace = {
        Range: ace.require("ace/range").Range
      };
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

    Mace.prototype._getCurrentRage = function() {
      var range;
      range = this.ace.selection.getRange();
      this.ace.selection.clearSelection();
      if (range.end.column === 0 && range.end.row - range.start.row === 1) {
        range.end.row--;
      }
      return range;
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
      var level, lv, pos, range, row, text, _i, _j, _ref, _ref1, _ref2;
      if (count == null) {
        count = 1;
      }
      if (count < 0 || count > 6) {
        throw new RangeError;
      }
      pos = this.ace.getCursorPosition();
      range = this._getCurrentRage();
      for (row = _i = _ref = range.start.row, _ref1 = range.end.row; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
        this.ace.moveCursorTo(row, 0);
        text = this.getLineText(row);
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
      this.ace.moveCursorTo(pos.row, pos.column + count - level);
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

    Mace.prototype.italic = function(mark, target_text) {
      var selected_text;
      if (mark == null) {
        mark = "*";
      }
      if (target_text == null) {
        target_text = "italic";
      }
      selected_text = this.ace.getCopyText().split("\n").join("");
      target_text = selected_text || target_text;
      this.ace.insert("" + mark + target_text + mark);
      return this.ace.focus();
    };

    Mace.prototype.bold = function(mark, target_text) {
      if (mark == null) {
        mark = "*";
      }
      if (target_text == null) {
        target_text = "bold";
      }
      return this.italic(mark + mark, target_text);
    };

    Mace.prototype.line = function(mark) {
      var pos;
      if (mark == null) {
        mark = "*";
      }
      pos = this.ace.getCursorPosition();
      if (pos.column > 0) {
        this.ace.insert("\n");
      }
      return this.ace.insert("\n" + mark + mark + mark + "\n");
    };

    Mace.prototype.getLineText = function(row) {
      var p, pos, text;
      pos = this.ace.getCursorPosition();
      row = row || pos.row;
      this.ace.moveCursorTo(row, 0);
      this.ace.navigateLineEnd();
      p = this.ace.getCursorPosition();
      this.ace.selection.addRange(new this.Ace.Range(p.row, 0, p.row, p.column));
      text = this.ace.getCopyText();
      this.ace.selection.clearSelection();
      this.ace.moveCursorTo(pos.row, pos.column);
      return text;
    };

    Mace.prototype.list = function(mark, items) {
      var indent_size, isList, match, pos, range, row, space_size, template, text, _i, _ref, _ref1;
      if (mark == null) {
        mark = "-";
      }
      if (items == null) {
        items = [];
      }
      pos = this.ace.getCursorPosition();
      range = this._getCurrentRage();
      if (range.start.row === range.end.row && items.length > 0) {
        if (isNaN(mark)) {
          template = function(item) {
            return "" + mark + " " + item;
          };
        } else {
          template = function(item) {
            return "" + (mark++) + ". " + item;
          };
        }
        this.ace.insert(items.map(template).join("\n") + "\n");
      } else {
        for (row = _i = _ref = range.start.row, _ref1 = range.end.row; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
          this.ace.moveCursorTo(row, 0);
          text = this.getLineText(row);
          match = text.match(/^(\s*)([*-]|[0-9]\.)(\s*)[^]+/);
          isList = match !== null;
          if (isList) {
            indent_size = match != null ? match[1].length : void 0;
            this.ace.moveCursorTo(row, indent_size);
            space_size = match != null ? match[2].length : void 0;
            this.ace.selection.addRange(new this.Ace.Range(row, 0, row, space_size + 1));
            this.ace.remove("right");
          } else {
            if (isNaN(mark)) {
              this.ace.insert("" + mark + " ");
            } else {
              this.ace.insert("" + (mark++) + ". ");
            }
          }
        }
      }
      this.ace.moveCursorTo(pos.row, pos.column + 2);
      return this.ace.focus();
    };

    Mace.prototype.code = function(code, lang) {
      var offset, pos, range, selected_text;
      if (code == null) {
        code = "";
      }
      if (lang == null) {
        lang = "";
      }
      pos = this.ace.getCursorPosition();
      selected_text = this.ace.getCopyText();
      if (~selected_text.indexOf("\n")) {
        range = this._getCurrentRage();
        offset = 1;
        this.ace.moveCursorTo(range.start.row, range.start.column);
        this.ace.insert("```" + lang + "\n");
        this.ace.moveCursorTo(range.end.row + offset, range.end.column);
        if (range.end.column !== 0) {
          this.ace.insert("\n");
          offset++;
        }
        this.ace.insert("```\n");
        this.ace.moveCursorTo(range.end.row + offset + 1, 0);
      } else {
        selected_text = selected_text.split("\n").join("");
        if (selected_text) {
          this.ace.remove("right");
          this.ace.insert("`" + selected_text + "`");
        } else {
          this.ace.insert("```" + lang + "\n" + code + "\n```\n");
          if (!code) {
            this.ace.moveCursorTo(pos.row + 1, 0);
          } else {
            this.ace.moveCursorTo(pos.row + code.split("\n").length + 3, 0);
          }
        }
      }
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

    Mace.prototype.quote = function(str) {
      var indent_size, isQuote, match, pos, range, row, space_size, text, _i, _ref, _ref1;
      if (str == null) {
        str = "";
      }
      pos = this.ace.getCursorPosition();
      range = this._getCurrentRage();
      if (range.start.row === range.end.row && str.length > 0) {
        this.ace.insert(str.split("\n").map(function(line) {
          return "> " + line;
        }).join("\n") + "\n");
      } else {
        for (row = _i = _ref = range.start.row, _ref1 = range.end.row; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
          this.ace.moveCursorTo(row, 0);
          text = this.getLineText(row);
          match = text.match(/^(\s*)>(\s*)[^]*/);
          isQuote = match !== null;
          if (isQuote) {
            indent_size = match != null ? match[1].length : void 0;
            this.ace.moveCursorTo(row, indent_size);
            space_size = match != null ? match[2].length : void 0;
            this.ace.selection.addRange(new this.Ace.Range(row, indent_size, row, space_size + 1));
            this.ace.remove("right");
          } else {
            this.ace.insert("> ");
          }
        }
      }
      this.ace.moveCursorTo(pos.row, pos.column + 2);
      return this.ace.focus();
    };

    return Mace;

  })();

  this.Mace = Mace;

}).call(this);
