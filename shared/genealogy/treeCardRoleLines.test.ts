import { KINSHIP_LABEL_FALLBACK } from "../humanKinshipLabel";
import { shortenTreeRoleEnglish, treeCardRoleLines } from "./treeCardRoleLines";

describe("treeCardRoleLines", () => {
  it("shortens long relative fallback", () => {
    expect(shortenTreeRoleEnglish(KINSHIP_LABEL_FALLBACK)).toBe("Relative");
  });

  it("dedupes identical english urdu lines", () => {
    const out = treeCardRoleLines("Grandson", "Grandson", "اولاد");
    expect(out.roleLineEn).toBe("Grandson");
    expect(out.roleLineUr).toBe("");
  });

  it("keeps urdu when distinct", () => {
    const out = treeCardRoleLines("Grandson", "پوتا", "اولاد");
    expect(out.roleLineUr).toBe("پوتا");
  });
});
