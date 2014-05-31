
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
      var btn, _ref, _ref1, _ref2;
      this.editor = editor;
      this.preview = preview;
      this.ace = ace.edit(this.editor);
      this.ace.getSession().setMode("ace/mode/markdown");
      this.ace.setTheme("ace/theme/monokai");
      marked.setOptions({
        renderer: new marked.Renderer,
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
      });
      this.ace.on("change", (function(_this) {
        return function() {
          var markdown;
          markdown = _this.ace.getValue();
          return marked(markdown, function(err, html) {
            if (err != null) {
              console.error(err);
            }
            return preview.innerHTML = html;
          });
        };
      })(this));
      Object.defineProperty(Mace.prototype, "value", {
        get: function() {
          return this.ace.getValue();
        }
      });
      Object.defineProperty(Mace.prototype, "font_size", {
        get: function() {
          return this.ace.getFontSize();
        },
        set: function(size) {
          return this.ace.setFontSize(size);
        }
      });
      if (btn = options != null ? options.button : void 0) {
        if ((_ref = btn.indent) != null) {
          _ref.addEventListener("click", this.indent.bind(this, 1));
        }
        if ((_ref1 = btn.outdent) != null) {
          _ref1.addEventListener("click", this.outdent.bind(this, 1));
        }
        if ((_ref2 = btn.heading) != null) {
          _ref2.addEventListener("click", this.heading.bind(this, 1));
        }
      }
    }

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
      var i, _i;
      if (count == null) {
        count = 1;
      }
      this.ace.navigateLineStart();
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        this.ace.insert("#");
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

    return Mace;

  })();

  this.Mace = Mace;

}).call(this);
