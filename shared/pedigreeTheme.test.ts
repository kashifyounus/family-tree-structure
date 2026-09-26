import { kuriosityPedigreeTheme } from "./pedigreeTheme";

describe("kuriosityPedigreeTheme", () => {
  it("uses cream canvas and forest primary", () => {
    expect(kuriosityPedigreeTheme.canvasBackground).toBe("#F6F1E7");
    expect(kuriosityPedigreeTheme.primaryAccent).toBe("#1B4332");
    expect(kuriosityPedigreeTheme.connector).not.toBe("#f3f4f6");
  });
});
