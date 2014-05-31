/* globals chai, Mace */
/**
 * Mace Test
 * for browser
 */

describe("Mace", function () {
  var mace;
  before(function () {
    var editor = document.createElement("div"),
        preview = document.createElement("div");

    editor.appendChild(document.createTextNode("test"));

    mace = new Mace(editor, preview);
    chai.expect(mace).to.have.property("value").and.to.equal("test");
  });
  beforeEach(function () {
    mace.clear(true);
    chai.expect(mace.value).to.equal("");
  });

  it("check properties", function () {
    chai.expect(mace).to.have.property("ace").and.to.be.an("object");
    chai.expect(mace).to.have.property("editor").and.to.be.an("object");
    chai.expect(mace).to.have.property("preview").and.to.be.an("object");
  });

  it("value", function () {
    mace.ace.insert("hello");
    chai.expect(mace).to.have.property("value").and.to.equal("hello");
  });

  it("#clear", function () {
    mace.ace.insert("clear");
    mace.clear(true);
    chai.expect(mace.value).to.equal("");
  });

  it("#clear (remove current line)", function () {
    mace.ace.insert("clear\nline");
    mace.clear();
    chai.expect(mace.value).to.equal("clear");
  });

  it("#indent", function () {
    mace.indent();
    chai.expect(mace.value).to.equal("    ");
  });

  it("#outdent", function () {
    mace.indent(2);
    mace.outdent();
    chai.expect(mace.value).to.equal("    ");
  });

  it("heading");
});
