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
  });

  it("check properties", function () {
    chai.expect(mace).to.have.property("ace").and.to.be.an("object");
    chai.expect(mace).to.have.property("editor").and.to.be.an("object");
    chai.expect(mace).to.have.property("preview").and.to.be.an("object");
  });

  it("value", function () {
    chai.expect(mace).to.have.property("value").and.to.equal("test");
  });

  it("#clear", function () {
    chai.expect(mace.clear(true)).to.equal(1);
    chai.expect(mace.value).to.equal("");
  });

  it("#indent", function () {
    mace.indent();
    chai.expect(mace.value).to.equal("    ");
    mace.clear(true);
  });

  it("#outdent", function () {
    mace.indent(2);
    mace.outdent();
    chai.expect(mace.value).to.equal("    ");
    mace.clear(true);
  });

  it("heading");
});
