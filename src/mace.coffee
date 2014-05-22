###!
# Mace 0.0.1
# copyright: Takenori Nakagawa
# license: MIT
###

## editor mace(DOMElement editor, DOMElement preview)
this.mace = (editor, preview, options) ->
  ## ace settings
  editor = ace.edit editor
  editor.getSession().setMode "ace/mode/markdown"
  editor.setTheme "ace/theme/monokai"

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
  editor.on "change", ->
    markdown = editor.getValue()
    ## compile markdown
    marked markdown, (err, html) ->
      if err? then console.error err
      ## update html preview
      preview.innerHTML = html

  if btn = options?.button
    btn.indent?.addEventListener "click", ->
      editor.indent()
      editor.focus()
    btn.outdent?.addEventListener "click", ->
      editor.blockOutdent()
      editor.focus()

  return editor
