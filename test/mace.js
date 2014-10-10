/* globals chai, Mace, ace */
/**
 * Mace Test
 * for browser
 */

var expect = chai.expect;

describe("Mace", function () {
  var Ace = {
    Range: ace.require("ace/range").Range
  };

  var mace;
  before(function () {
    var editor = document.createElement("div"),
        preview = document.createElement("div");

    editor.appendChild(document.createTextNode("test"));

    mace = new Mace(editor, preview);
    expect(mace).to.have.property("value").and.to.equal("test");
  });
  beforeEach(function () {
    mace.ace.selection.clearSelection();
    mace.clear(true);
    expect(mace.value).to.equal("");
    mace.font_size = 12;
  });

  it("check properties", function () {
    expect(mace).to.have.property("ace").and.to.be.an("object");
    expect(mace).to.have.property("editor").and.to.be.an("object");
    expect(mace).to.have.property("preview").and.to.be.an("object");
  });

  it("value", function () {
    mace.ace.insert("hello");
    expect(mace).to.have.property("value").and.to.equal("hello");
  });

  it("font_size", function () {
    expect(mace).to.have.property("font_size").and.to.equal(12);
    expect(++mace.font_size).to.equal(13);
  });

  it("#clear (remove all)", function () {
    mace.ace.insert("clear");
    mace.clear(true);
    expect(mace.value).to.equal("");
  });

  it("#clear (remove current line)", function () {
    mace.ace.insert("clear\nline");
    mace.clear();
    expect(mace.value).to.equal("clear");
  });

  it("#indent", function () {
    mace.indent();
    expect(mace.value).to.equal("    ");
  });

  it("#outdent", function () {
    mace.indent(2);
    mace.outdent();
    expect(mace.value).to.equal("    ");
  });

  it("#heading", function () {
    mace.ace.insert("Mace");
    mace.ace.moveCursorTo(0, 0);
    mace.heading();
    expect(mace.value).to.equal("#Mace");
    expect(mace.ace.getCursorPosition().column).to.equal(1);
  });

  it("#heading (level up 1 -> 2)", function () {
    mace.ace.insert("#Mace");
    mace.ace.moveCursorTo(0, 1);
    mace.heading(2);
    expect(mace.value).to.equal("##Mace");
    expect(mace.ace.getCursorPosition().column).to.equal(2);
  });

  it("#heading (level down 2 -> 1)", function () {
    mace.ace.insert("##Mace");
    mace.ace.moveCursorTo(0, 2);
    mace.heading(1);
    expect(mace.value).to.equal("#Mace");
    expect(mace.ace.getCursorPosition().column).to.equal(1);
  });

  it("#heading (select a line)", function () {
    mace.ace.insert("##Mace\nMace = Markdown editor powered by Ace.\n");
    var range = new Ace.Range(1, 0, 2, 0);
    mace.ace.moveCursorTo(2, 0);
    mace.ace.selection.addRange(range);
    mace.heading(3);
    expect(mace.value).to.equal("##Mace\n###Mace = Markdown editor powered by Ace.\n");
  });

  it("#heading (select multi lines)", function () {
    mace.ace.insert("##Mace\n###Mace = Markdown editor powered by Ace.\n\n");
    var range = new Ace.Range(0, 0, 2, 0);
    mace.ace.moveCursorTo(2, 0);
    mace.ace.selection.addRange(range);
    mace.heading(3);
    expect(mace.value).to.equal("###Mace\n###Mace = Markdown editor powered by Ace.\n###\n");
  });

  it("#heading (range check)", function () {
    expect(mace.heading.bind(mace, -1)).to.throw(RangeError);
    expect(mace.heading.bind(mace, 7)).to.throw(RangeError);
  });

  it("#link (empty)", function () {
    mace.link();
    expect(mace.value).to.equal("[link](./)");
  });

  it("#link (select)", function () {
    mace.ace.insert("This is a editor.");
    var range = new Ace.Range(0, 10, 0, 16);
    mace.ace.moveCursorTo(0, 16);
    mace.ace.selection.addRange(range);
    mace.link("https://github.com/ww24/mace");
    expect(mace.value).to.equal("This is a [editor](https://github.com/ww24/mace).");
  });

  it("#link (select & set link_text)", function () {
    mace.ace.insert("This is a editor.");
    var range = new Ace.Range(0, 10, 0, 16);
    mace.ace.moveCursorTo(0, 16);
    mace.ace.selection.addRange(range);
    mace.link("https://github.com/ww24/mace", "mace");
    expect(mace.value).to.equal("This is a [mace](https://github.com/ww24/mace).");
  });

  it("#link (select & set link_text & set title)", function () {
    mace.ace.insert("This is a editor.");
    var range = new Ace.Range(0, 10, 0, 16);
    mace.ace.moveCursorTo(0, 16);
    mace.ace.selection.addRange(range);
    mace.link("https://github.com/ww24/mace", "mace", "title");
    expect(mace.value).to.equal("This is a [mace](https://github.com/ww24/mace \"title\").");
  });

  it("#link (select & set link_text & set title & image)", function () {
    mace.ace.insert("This is a editor.");
    var range = new Ace.Range(0, 10, 0, 16);
    mace.ace.moveCursorTo(0, 16);
    mace.ace.selection.addRange(range);
    mace.link("https://github.com/ww24/mace", "mace", "title", true);
    expect(mace.value).to.equal("This is a ![mace](https://github.com/ww24/mace \"title\").");
  });

  it("getLineText", function () {
    mace.ace.insert("This is a editor.");
    var text = mace.getLineText();
    expect(text).to.equal("This is a editor.");
  });

  it("#list", function () {
    mace.ace.insert("list item 1");
    mace.list();
    expect(mace.value).to.equal("- list item 1");
  });

  it("#list toggle reset", function () {
    mace.ace.insert("- list item 1");
    mace.list();
    expect(mace.value).to.equal("list item 1");
  });

  it("#list *", function () {
    mace.ace.insert("list item 1");
    mace.list("*");
    expect(mace.value).to.equal("* list item 1");
  });

  it("#list multi lines", function () {
    mace.ace.insert("list item 1\nlist item 2");
    var range = new Ace.Range(0, 0, 1, 1);
    mace.ace.moveCursorTo(0, 0);
    mace.ace.selection.addRange(range);
    mace.list();
    expect(mace.value).to.equal("- list item 1\n- list item 2");
  });

  it("#list multi lines (toggle reset)", function () {
    mace.ace.insert("- list item 1\n- list item 2");
    var range = new Ace.Range(0, 0, 1, 1);
    mace.ace.moveCursorTo(0, 0);
    mace.ace.selection.addRange(range);
    mace.list();
    expect(mace.value).to.equal("list item 1\nlist item 2");
  });

  it("#list set initial items", function () {
    mace.list("*", ["item 1", "item 2", "item 3"]);

    expect(mace.value).to.equal("* item 1\n* item 2\n* item 3\n");
  });

  it("#code", function () {
    mace.code();
    expect(mace.value).to.equal("```\n\n```\n");
    var pos = mace.ace.getCursorPosition();
    expect(pos.row).to.equal(1);
    expect(pos.column).to.equal(0);
  });

  it("#code selection", function () {
    mace.ace.insert("1. console.log(\"test\"); is debug message.");
    var range = new Ace.Range(0, 3, 0, 23);
    mace.ace.moveCursorTo(0, 3);
    mace.ace.selection.addRange(range);

    mace.code();

    expect(mace.value).to.equal("1. `console.log(\"test\");` is debug message.");
    expect(mace.ace.getCursorPosition().column).to.equal(25);
  });

  it("#code multi lines", function () {
    mace.ace.insert("function () {\n  console.log(\"test\");\n}\n");
    var range = new Ace.Range(0, 0, 3, 0);
    mace.ace.moveCursorTo(0, 0);
    mace.ace.selection.addRange(range);

    mace.code();

    expect(mace.value).to.equal("```\nfunction () {\n  console.log(\"test\");\n}\n```\n");

    var pos = mace.ace.getCursorPosition();
    expect(pos.row).to.equal(5);
    expect(pos.column).to.equal(0);
  });

  it("#code set language", function () {
    mace.ace.insert("function () {\n  console.log(\"test\");\n}");
    var range = new Ace.Range(0, 0, 2, 1);
    mace.ace.moveCursorTo(0, 0);
    mace.ace.selection.addRange(range);

    mace.code(null, "js");

    expect(mace.value).to.equal("```js\nfunction () {\n  console.log(\"test\");\n}\n```\n");

    var pos = mace.ace.getCursorPosition();
    expect(pos.row).to.equal(5);
    expect(pos.column).to.equal(0);
  });

  it("#code insert code block", function () {
    mace.code("function () {\n  console.log(\"test\");\n}", "js");

    expect(mace.value).to.equal("```js\nfunction () {\n  console.log(\"test\");\n}\n```\n");

    var pos = mace.ace.getCursorPosition();
    expect(pos.row).to.equal(5);
    expect(pos.column).to.equal(0);
  });

  it("#italic (empty)", function () {
    mace.italic();

    expect(mace.value).to.equal("*italic*");
  });

  it("#italic (set mark & string)", function () {
    mace.italic("_", "text");

    expect(mace.value).to.equal("_text_");
  });

  it("#italic (selected)", function () {
    mace.ace.insert("This is a editor.");
    var range = new Ace.Range(0, 10, 0, 16);
    mace.ace.moveCursorTo(0, 16);
    mace.ace.selection.addRange(range);

    mace.italic();

    expect(mace.value).to.equal("This is a *editor*.");

    var pos = mace.ace.getCursorPosition();
    expect(pos.row).to.equal(0);
    expect(pos.column).to.equal(18);
  });

  it("#italic (selected_text is prior to target_text)", function () {
    mace.ace.insert("This is a editor.");
    var range = new Ace.Range(0, 10, 0, 16);
    mace.ace.moveCursorTo(0, 16);
    mace.ace.selection.addRange(range);

    mace.italic("*", "text");

    expect(mace.value).to.equal("This is a *editor*.");

    var pos = mace.ace.getCursorPosition();
    expect(pos.row).to.equal(0);
    expect(pos.column).to.equal(18);
  });

  it("#blod (empty)", function () {
    mace.bold();

    expect(mace.value).to.equal("**bold**");
  });

  it("#italic (set mark & string)", function () {
    mace.bold("_", "text");

    expect(mace.value).to.equal("__text__");
  });

  it("#italic (selected)", function () {
    mace.ace.insert("This is a editor.");
    var range = new Ace.Range(0, 10, 0, 16);
    mace.ace.moveCursorTo(0, 16);
    mace.ace.selection.addRange(range);

    mace.bold();

    expect(mace.value).to.equal("This is a **editor**.");

    var pos = mace.ace.getCursorPosition();
    expect(pos.row).to.equal(0);
    expect(pos.column).to.equal(20);
  });

  it("#italic (selected_text is prior to target_text)", function () {
    mace.ace.insert("This is a editor.");
    var range = new Ace.Range(0, 10, 0, 16);
    mace.ace.moveCursorTo(0, 16);
    mace.ace.selection.addRange(range);

    mace.bold("*", "text");

    expect(mace.value).to.equal("This is a **editor**.");

    var pos = mace.ace.getCursorPosition();
    expect(pos.row).to.equal(0);
    expect(pos.column).to.equal(20);
  });
});
