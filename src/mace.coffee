###!
# Mace 0.1.2
# copyright: Takenori Nakagawa
# license: MIT
###

"use strict"

## new mace(DOMElement editor, DOMElement preview[, options])
class Mace
  constructor: (@editor, @preview = null, options = {}) ->
    mace = @

    ## Ace Constructors
    @Ace =
      Range: ace.require("ace/range").Range

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

  _getCurrentRage: () ->
    # get selection range
    range = @ace.selection.getRange()
    @ace.selection.clearSelection()
    range.end.row-- if range.end.column is 0 and range.end.row - range.start.row is 1
    return range

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

    range = @_getCurrentRage()

    # get heading level and set it
    for row in [range.start.row..range.end.row]
      @ace.moveCursorTo row, 0
      # get line text
      text = @getLineText row

      # detect heading level
      level = text.match(/^#+/i)?[0].length or 0
      # adjust heading level
      continue if level is count
      for lv in [level...count]
        if level < count
          @ace.insert "#"
        else
          @ace.remove "right"

    @ace.moveCursorTo pos.row, pos.column + count - level
    @ace.focus()

  link: (href = "./", link_text, title = "", is_image = false) ->
    selected_text = @ace.getCopyText().split("\n").join("")
    link_text = link_text or selected_text or "link"
    title = " \"#{title}\"" if title.length > 0
    image = ["", "!"][+ is_image]
    @ace.insert "#{image}[#{link_text}](#{href}#{title})"
    @ace.focus()

  italic: (mark = "*", target_text = "italic") ->
    selected_text = @ace.getCopyText().split("\n").join("")
    target_text = selected_text or target_text
    @ace.insert "#{mark}#{target_text}#{mark}"
    @ace.focus()

  bold: (mark = "*", target_text = "bold") ->
    @italic mark + mark, target_text

  line: (mark = "*") ->
    pos = @ace.getCursorPosition()

    @ace.insert "\n" if pos.column > 0
    @ace.insert "\n" + mark + mark + mark + "\n"

  getLineText: (row) ->
    pos = @ace.getCursorPosition()
    row = row or pos.row
    # create selection
    @ace.moveCursorTo row, 0
    # get EOL column
    @ace.navigateLineEnd()
    p = @ace.getCursorPosition()
    # create range of current line
    @ace.selection.addRange new @Ace.Range p.row, 0, p.row, p.column
    # get text
    text = @ace.getCopyText()
    @ace.selection.clearSelection()
    # reset cursor position
    @ace.moveCursorTo pos.row, pos.column
    return text

  list: (mark = "-", items = []) ->
    # curser position
    pos = @ace.getCursorPosition()

    range = @_getCurrentRage()

    if range.start.row is range.end.row and items.length > 0
      # init items mode
      if isNaN mark
        template = (item) -> "#{mark} #{item}"
      else
        template = (item) -> "#{mark++}. #{item}"

      @ace.insert items.map(template).join("\n") + "\n"
    else
      # get heading level and set it
      for row in [range.start.row..range.end.row]
        @ace.moveCursorTo row, 0
        # get line text
        text = @getLineText row

        match = text.match /^(\s*)([*-]|[0-9]\.)(\s*)[^]+/
        # detect list
        isList = match isnt null
        # set list
        if isList
          # detect indent size
          indent_size = match?[1].length
          @ace.moveCursorTo row, indent_size
          # detect space
          space_size = match?[2].length
          # 範囲選択後に削除
          @ace.selection.addRange new @Ace.Range row, 0, row, space_size + 1
          @ace.remove "right"
        else
          if isNaN mark
            @ace.insert "#{mark} "
          else
            @ace.insert "#{mark++}. "

    @ace.moveCursorTo pos.row, pos.column + 2
    @ace.focus()

  code: (code = "", lang = "") ->
    # curser position
    pos = @ace.getCursorPosition()

    selected_text = @ace.getCopyText()

    # check multi lines
    if ~ selected_text.indexOf("\n")
      # multi line code insert mode
      range = @_getCurrentRage()
      offset = 1
      @ace.moveCursorTo range.start.row, range.start.column
      @ace.insert "```#{lang}\n"
      @ace.moveCursorTo range.end.row + offset, range.end.column
      if range.end.column isnt 0
        @ace.insert "\n"
        offset++
      @ace.insert "```\n"
      @ace.moveCursorTo range.end.row + offset + 1, 0
    else
      selected_text = selected_text.split("\n").join("")
      if selected_text
        # single line code insert mode
        @ace.remove "right"
        @ace.insert "`#{selected_text}`"
      else
        # code insert from code argument mode
        @ace.insert "```#{lang}\n#{code}\n```\n"
        unless code
          @ace.moveCursorTo pos.row + 1, 0
        else
          @ace.moveCursorTo pos.row + code.split("\n").length + 3, 0

    @ace.focus()

  clear: (force = false) ->
    if force
      @ace.setValue ""
    else
      @ace.removeLines()

  quote: (str = "") ->
    # curser position
    pos = @ace.getCursorPosition()

    range = @_getCurrentRage()

    if range.start.row is range.end.row and str.length > 0
      # init str mode
      @ace.insert str.split("\n").map((line) -> "> #{line}").join("\n") + "\n"
    else
      for row in [range.start.row..range.end.row]
        @ace.moveCursorTo row, 0
        # get line text
        text = @getLineText row

        match = text.match /^(\s*)>(\s*)[^]*/
        # detect quote
        isQuote = match isnt null
        # set quote
        if isQuote
          # detect indent size
          indent_size = match?[1].length
          @ace.moveCursorTo row, indent_size
          # detect space
          space_size = match?[2].length
          # 範囲選択後に削除
          @ace.selection.addRange new @Ace.Range row, indent_size, row, space_size + 1
          @ace.remove "right"
        else
          @ace.insert "> "

    @ace.moveCursorTo pos.row, pos.column + 2
    @ace.focus()

this.Mace = Mace
