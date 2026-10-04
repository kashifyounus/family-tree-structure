import {
  buildPedigreeCanvasPayload,
  marriageBandForPartnerOnRow,
  PEDIGREE_CARD_BIG_W,
} from "@/lib/graph/pedigreeCanvasPayload";
import type { PedigreeCanvasNode } from "@/lib/graph/pedigreeCanvasPayload";
import type { FamilyGraph } from "@/lib/graph/types";

function node(
  id: string,
  x: number,
  y: number,
  opts?: { big?: boolean },
): PedigreeCanvasNode {
  const big = opts?.big ?? true;
  return {
    id,
    familyCode: `FAM-${id}`,
    label: id,
    nameLine1: id,
    nameLine2: "",
    initials: id.slice(0, 2).toUpperCase(),
    years: "",
    gender: "MALE",
    nickname: null,
    x,
    y,
    w: big ? PEDIGREE_CARD_BIG_W : 88,
    h: big ? 74 : 62,
    tier: big ? "big" : "small",
    isFocal: id === "ego",
    isDeceased: false,
    isPrivate: false,
    hasUnexpandedParents: false,
    hasUnexpandedChildren: false,
  };
}

describe("pedigree canvas layout (T8 contract)", () => {
  it("marriageBandForPartnerOnRow uses adjacent gap for non-adjacent spouse", () => {
    const ego = node("ego", 0, 200);
    const s1 = node("s1", 160, 200);
    const s2 = node("s2", 320, 200);
    const row = [ego, s1, s2];

    const primary = marriageBandForPartnerOnRow(ego, s1, "Married A", row);
    const secondary = marriageBandForPartnerOnRow(ego, s2, "Married B", row);

    expect(primary?.x1).toBe(ego.x + ego.w);
    expect(primary?.x2).toBe(s1.x);
    expect(secondary?.x1).toBe(s1.x + s1.w);
    expect(secondary?.x2).toBe(s2.x);
    expect(secondary!.x2 - secondary!.x1).toBeLessThan(PEDIGREE_CARD_BIG_W);
  });

  it("payload marriage bands do not span across the first spouse card", () => {
    const graph: FamilyGraph = {
      focalPersonId: "ego",
      focalPartnerIds: ["s1", "s2"],
      focalMarriageBands: [
        { partnerId: "s1", label: "Married A" },
        { partnerId: "s2", label: "Married B" },
      ],
      nodes: [
        {
          id: "ego",
          type: "person",
          position: { x: 0, y: 200 },
          data: {
            isFocal: true,
            person: {
              id: "ego",
              familyCode: "FAM-ego",
              firstName: "Ego",
              lastName: "One",
              gender: "MALE",
              birthDate: null,
              deathDate: null,
              currentCity: null,
              isLiving: true,
            },
          },
        },
        {
          id: "s1",
          type: "person",
          position: { x: 160, y: 200 },
          data: {
            person: {
              id: "s1",
              familyCode: "FAM-s1",
              firstName: "Spouse",
              lastName: "A",
              gender: "FEMALE",
              birthDate: null,
              deathDate: null,
              currentCity: null,
              isLiving: true,
            },
          },
        },
        {
          id: "s2",
          type: "person",
          position: { x: 320, y: 200 },
          data: {
            person: {
              id: "s2",
              familyCode: "FAM-s2",
              firstName: "Spouse",
              lastName: "B",
              gender: "FEMALE",
              birthDate: null,
              deathDate: null,
              currentCity: null,
              isLiving: true,
            },
          },
        },
      ],
      edges: [],
    };

    const payload = buildPedigreeCanvasPayload(graph);
    const second = payload.marriageBands?.[1];
    expect(second).toBeDefined();
    const s1Right = 160 + PEDIGREE_CARD_BIG_W;
    expect(second!.x1).toBeGreaterThanOrEqual(s1Right - 1);
    expect(second!.x2).toBeLessThanOrEqual(320 + 1);
  });
});
