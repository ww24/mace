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
    if @preview isnt null
      @_render()
      ## listen editor change event
      @ace.on "change", => @_render()

    # mace.value => String
    Object.defineProperty @, "value",
      get: -> @ace.getValue()

    # mace.font_size => Number
    Object.defineProperty @, "font_size",
      get: -> @ace.getFontSize()
      set: (size) -> @ace.setFontSize size

  _render: () ->
    markdown = @ace.getValue()
    ## compile markdown
    marked markdown, (err, html) =>
      console.error err if err?
      ## update html preview
      @preview.innerHTML = html

  indent: (count = 1) ->
    @ace.indent() for i in [0...count]
    @ace.focus()

  outdent: (count = 1) ->
    @ace.blockOutdent() for i in [0...count]
    @ace.focus()

  heading: (count = 1) ->
    # check range
    if count < 0 || count > 6
      throw new RangeError

    # curser position
    pos = @ace.getCursorPosition()

    # get selection range
    range = @ace.selection.getRange()
    @ace.selection.clearSelection()
    range.end.row-- if range.end.column is 0 and range.end.row - range.start.row is 1
    row_length = range.end.row - range.start.row

    # get Ace Range constructor
    Range = range.constructor;

    # get heading level and set it
    for row in [range.start.row..range.end.row]
      # create selection
      @ace.moveCursorTo row, 0
      # get EOL column
      @ace.navigateLineEnd()
      p = @ace.getCursorPosition()
      # create range of current line
      @ace.selection.addRange new Range p.row, 0, p.row, p.column
      # get text
      text = @ace.getCopyText()
      @ace.selection.clearSelection()
      @ace.moveCursorTo row, 0

      # detect heading level
      level = text.match(/^#+/i)?[0].length or 0
      # adjust heading level
      continue if level is count
      for lv in [level...count]
        if level < count
          @ace.insert "#"
        else
          @ace.remove "right"

    @ace.moveCursorTo pos.row, pos.column + count
    @ace.focus()

  link: (href = "./", link_text, title = "", is_image = false) ->
    selected_text = @ace.getCopyText().split("\n").join("")
    link_text = link_text or selected_text or "link"
    title = " \"#{title}\"" if title.length > 0
    image = ["", "!"][+ is_image]
    @ace.insert "#{image}[#{link_text}](#{href}#{title})"
    @ace.focus()

  clear: (force = false) ->
    if force
      @ace.setValue ""
    else
      @ace.removeLines()

this.Mace = Mace;
