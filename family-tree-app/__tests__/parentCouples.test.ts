import {
  formatCoupleLabel,
  orderedCouplePartners,
  type ParentCoupleRow,
} from "@/lib/db/parentCouples";
import { UNKNOWN_COPARENT_FAMILY_CODE } from "../../shared/unknownCoParent";

function row(overrides: Partial<ParentCoupleRow> = {}): ParentCoupleRow {
  return {
    unionId: "u1",
    partner1Id: "p1",
    partner2Id: "p2",
    partner1Code: "FAM-P1",
    partner2Code: "FAM-P2",
    partner1Name: "Ali Khan",
    partner2Name: "Fatima Khan",
    partner1Gender: "FEMALE",
    partner2Gender: "MALE",
    marriageDate: null,
    isActive: true,
    childCount: 0,
    ...overrides,
  };
}

describe("parentCouples helpers", () => {
  it("orders partners husband left, wife right by gender", () => {
    const { husband, wife } = orderedCouplePartners(row());
    expect(husband.name).toBe("Fatima Khan");
    expect(wife.name).toBe("Ali Khan");
    expect(husband.id).toBe("p2");
    expect(wife.id).toBe("p1");
  });

  it("labels unknown co-parent without exposing sentinel family code", () => {
    const label = formatCoupleLabel(
      row({
        partner1Name: "Ali Khan",
        partner1Gender: "MALE",
        partner1Code: "FAM-ALI",
        partner2Name: "Unknown Parent",
        partner2Gender: "FEMALE",
        partner2Code: UNKNOWN_COPARENT_FAMILY_CODE.FEMALE,
      }),
    );
    expect(label).toContain("Unknown co-parent");
    expect(label).not.toContain(UNKNOWN_COPARENT_FAMILY_CODE.FEMALE);
  });
});
