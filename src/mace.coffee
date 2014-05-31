###!
# Mace 0.0.1
# copyright: Takenori Nakagawa
# license: MIT
###

"use strict"

## new mace(DOMElement editor, DOMElement preview[, options])
class Mace
  constructor: (@editor, @preview = null, options = {}) ->
    mace = @

    ## ace settings
    @ace = ace.edit @editor
    @ace.getSession().setMode "ace/mode/markdown"
    @ace.setTheme "ace/theme/monokai"

    ## marked settings
    marked.setOptions
      renderer: new marked.Renderer()
      gfm: true
      tables: true
      breaks: true
      pedantic: false
      sanitize: true
      smartLists: true
      smartypants: false

    # markdown realtime preview
    if preview isnt null
      ## listen editor change event
      @ace.on "change", =>
        markdown = @ace.getValue()
        ## compile markdown
        marked markdown, (err, html) =>
          if err? then console.error err
          ## update html preview
          preview.innerHTML = html

    # mace.value => String
    Object.defineProperty Mace::, "value",
      get: -> @ace.getValue()

    # mace.font_size => Number
    Object.defineProperty Mace::, "font_size",
      get: -> @ace.getFontSize()
      set: (size) -> @ace.setFontSize(size)

    # DOM binding
    if btn = options.button
      Object.keys(Mace::).forEach (prop) ->
        btn[prop]?.addEventListener "click", ->
          mace[prop].apply mace, @.dataset.maceArgs?.split ","

  indent: (count = 1) ->
    @ace.indent() for i in [0...count]
    @ace.focus()

  outdent: (count = 1) ->
    @ace.blockOutdent() for i in [0...count]
    @ace.focus()

  heading: (count = 1) ->
    pos = @ace.getCursorPosition()
    @ace.navigateLineStart()
    @ace.insert "#" for i in [0...count]
    @ace.moveCursorTo pos.row, pos.column + count
    @ace.focus()

  link: (href = "./", link_text) ->
    selected_text = @ace.getCopyText().split("\n").join("")
    link_text = link_text or selected_text or "link"
    @ace.insert "[#{link_text}](#{href})"
    @ace.focus()

  clear: (force = false) ->
    if force
      @ace.setValue ""
    else
      @ace.removeLines()

this.Mace = Mace;
