###!
# Mace 0.0.1
# copyright: Takenori Nakagawa
# license: MIT
###

"use strict"

## new mace(DOMElement editor, DOMElement preview[, options])
class Mace
  constructor: (@editor, @preview, options) ->
    ## ace settings
    @ace = ace.edit @editor
    @ace.getSession().setMode "ace/mode/markdown"
    @ace.setTheme "ace/theme/monokai"

    ## marked settings
    marked.setOptions
      renderer: new marked.Renderer
      gfm: true
      tables: true
      breaks: true
      pedantic: false
      sanitize: true
      smartLists: true
      smartypants: false

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

    if btn = options?.button
      btn.indent?.addEventListener "click", @indent.bind @, 1
      btn.outdent?.addEventListener "click", @outdent.bind @, 1
      btn.heading?.addEventListener "click", @heading.bind @, 1

  indent: (count = 1) ->
    @ace.indent() for i in [0...count]
    @ace.focus()

  outdent: (count = 1) ->
    @ace.blockOutdent() for i in [0...count]
    @ace.focus()

  heading: (count = 1) ->
    @ace.navigateLineStart()
    @ace.insert "#" for i in [0...count]
    @ace.focus()

  clear: (force = false) ->
    if force
      (@ace.removeLines() until @value is "").length

this.Mace = Mace;
