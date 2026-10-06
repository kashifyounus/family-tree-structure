import {
  collectIncludedPersonIds,
  layoutMarriageCentricGraph,
} from "../../shared/marriageTreeLayout";
import { buildPedigreeCanvasPayload } from "@/lib/graph/pedigreeCanvasPayload";
import type { Gender } from "@/lib/data/types";
import type { FamilyGraph, FamilyGraphNode } from "@/lib/graph/types";
import { PEDIGREE_CARD_BIG_W } from "@/lib/graph/pedigreeCanvasPayload";

/** Layout contract: marriage row + child columns (no SQLite). */
describe("tree layout contract", () => {
  const twoSpouseUnions = [
    {
      id: "u1",
      partner1Id: "ego",
      partner2Id: "spouse1",
      childships: [{ childId: "c1" }],
    },
    {
      id: "u2",
      partner1Id: "ego",
      partner2Id: "spouse2",
      childships: [{ childId: "c2" }],
    },
    {
      id: "u-parent",
      partner1Id: "dad",
      partner2Id: "mom",
      childships: [{ childId: "ego" }],
    },
  ];

  const people = new Map(
    [
      { id: "ego", birthDate: "1980-01-01", gender: "MALE" },
      { id: "spouse1", birthDate: "1982-01-01", gender: "FEMALE" },
      { id: "spouse2", birthDate: "1985-01-01", gender: "FEMALE" },
      { id: "c1", birthDate: "2010-01-01", gender: "MALE" },
      { id: "c2", birthDate: "2012-01-01", gender: "FEMALE" },
      { id: "dad", birthDate: "1950-01-01", gender: "MALE" },
      { id: "mom", birthDate: "1952-01-01", gender: "FEMALE" },
    ].map((p) => [p.id, p]),
  );

  it("places focal wife to the right of husband on the marriage row", () => {
    const gendered = new Map(people);
    gendered.set("ego", {
      id: "ego",
      birthDate: "1982-01-01",
      gender: "FEMALE",
    });
    gendered.set("spouse1", {
      id: "spouse1",
      birthDate: "1980-01-01",
      gender: "MALE",
    });
    const unions = [
      {
        id: "u1",
        partner1Id: "ego",
        partner2Id: "spouse1",
        childships: [{ childId: "c1" }],
      },
      {
        id: "u-parent",
        partner1Id: "dad",
        partner2Id: "mom",
        childships: [{ childId: "ego" }],
      },
    ];
    const included = collectIncludedPersonIds("ego", unions, 1, 1, 0);
    const { positions } = layoutMarriageCentricGraph(
      "ego",
      gendered,
      unions,
      included,
    );
    expect(positions.get("ego")!.x).toBeGreaterThan(positions.get("spouse1")!.x);
  });

  it("builds a marriage band for the primary spouse on canvas (B1)", () => {
    const included = collectIncludedPersonIds(
      "ego",
      twoSpouseUnions,
      1,
      1,
      0,
    );
    const { positions, focalPartnerIds } = layoutMarriageCentricGraph(
      "ego",
      people,
      twoSpouseUnions,
      included,
    );

    const toNode = (id: string, isFocal: boolean): FamilyGraphNode => {
      const pos = positions.get(id)!;
      const rawGender = people.get(id)?.gender ?? "MALE";
      const gender: Gender =
        rawGender === "FEMALE" || rawGender === "OTHER" ? rawGender : "MALE";
      return {
        id,
        type: "person",
        position: pos,
        data: {
          isFocal,
          person: {
            id,
            familyCode: `FAM-${id}`,
            firstName: id,
            lastName: "Test",
            gender,
            birthDate: null,
            deathDate: null,
            currentCity: null,
            isLiving: true,
          },
        },
      };
    };

    const graph: FamilyGraph = {
      focalPersonId: "ego",
      focalPartnerIds,
      focalMarriageBands: focalPartnerIds.map((partnerId, i) => ({
        partnerId,
        label: i === 0 ? "Married 2005" : "Married 2010",
      })),
      nodes: [
        toNode("ego", true),
        toNode("spouse1", false),
        toNode("spouse2", false),
        toNode("c1", false),
        toNode("c2", false),
      ],
      edges: [],
    };

    const payload = buildPedigreeCanvasPayload(graph);
    expect(payload.marriageBands?.length).toBe(2);
    expect(payload.marriageBands?.[0]?.x2).toBeLessThanOrEqual(
      (positions.get("spouse1")?.x ?? 0) + 2,
    );

    const egoX = positions.get("ego")!.x;
    const s1X = positions.get("spouse1")!.x;
    const c1X = positions.get("c1")!.x;
    const mid1 = (Math.min(egoX, s1X) + Math.max(egoX, s1X) + PEDIGREE_CARD_BIG_W) / 2;
    expect(Math.abs(c1X + 44 - mid1)).toBeLessThan(48);
  });
});
