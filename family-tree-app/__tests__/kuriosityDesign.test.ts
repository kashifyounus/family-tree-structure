import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";

describe("kuriosityDesign", () => {
  it("exposes brand and pedigree tokens", () => {
    expect(kuriosityDesign.brand.primary).toBe("#1B4332");
    expect(kuriosityDesign.pedigree.cardWidth).toBeGreaterThan(0);
    expect(kuriosityDesign.form.inputMinHeight).toBe(48);
  });
});
