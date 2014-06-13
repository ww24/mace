
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
      var btn, mace;
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
      if (btn = options.button) {
        Object.keys(Mace.prototype).forEach(function(prop) {
          var _ref;
          if (prop.charAt(0) === "_") {
            return;
          }
          return (_ref = btn[prop]) != null ? _ref.addEventListener("click", function() {
            var _ref1;
            return mace[prop].apply(mace, (_ref1 = this.dataset.maceArgs) != null ? _ref1.split(",") : void 0);
          }) : void 0;
        });
      }
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
      var i, pos, _i;
      if (count == null) {
        count = 1;
      }
      pos = this.ace.getCursorPosition();
      this.ace.navigateLineStart();
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        this.ace.insert("#");
      }
      this.ace.moveCursorTo(pos.row, pos.column + count);
      return this.ace.focus();
    };

    Mace.prototype.link = function(href, link_text) {
      var selected_text;
      if (href == null) {
        href = "./";
      }
      selected_text = this.ace.getCopyText().split("\n").join("");
      link_text = link_text || selected_text || "link";
      this.ace.insert("[" + link_text + "](" + href + ")");
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
