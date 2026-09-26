import {
  defaultParentSlotForOpen,
  mergeParentSlot,
  splitParentsByRole,
} from "@/lib/rules/parentSlots";
import type { KinshipPerson } from "@/lib/kinship/types";

function person(id: string, gender: "MALE" | "FEMALE"): KinshipPerson {
  return {
    id,
    familyCode: `FAM-${id}`,
    firstName: id,
    lastName: "Test",
    nickname: null,
    urduFirstName: null,
    urduLastName: null,
    gender,
    birthDate: null,
    deathDate: null,
    currentCity: null,
    birthPlace: null,
    homeTown: null,
    occupation: null,
    bio: null,
  };
}

describe("parentSlots", () => {
  it("splits parents by gender", () => {
    const split = splitParentsByRole([person("dad", "MALE"), person("mom", "FEMALE")]);
    expect(split.father?.id).toBe("dad");
    expect(split.mother?.id).toBe("mom");
  });

  it("merges a second parent into a complete pair", () => {
    const merged = mergeParentSlot("mother", "mom", {
      father: person("dad", "MALE"),
      mother: null,
    });
    expect(merged).toEqual({
      complete: true,
      parentAId: "dad",
      parentBId: "mom",
    });
  });

  it("stages when only one parent slot is filled", () => {
    const merged = mergeParentSlot("father", "dad", { father: null, mother: null });
    expect(merged).toEqual({
      complete: false,
      stagedParentId: "dad",
      otherSlot: "mother",
    });
  });

  it("picks the open slot when one parent exists", () => {
    expect(
      defaultParentSlotForOpen([person("dad", "MALE")], null),
    ).toBe("mother");
  });
});
