import { buildCuratedPedigreeDemo } from "../demoDataset/buildCuratedPedigreeDemo";
import {
  collectIncludedPersonIds,
  layoutMarriageCentricGraph,
} from "../marriageTreeLayout";
import { PEDIGREE_CARD_SMALL_W, PEDIGREE_MIN_L_JOG } from "../pedigreeLayoutTokens";

describe("siblingMarriageSubtreeLayout", () => {
  it("places each sibling's spouse and children under their own column without overlapping focal children", () => {
    const dataset = buildCuratedPedigreeDemo();
    const unions = dataset.unions.map((u) => ({
      id: u.id,
      partner1Id: u.partner1Id,
      partner2Id: u.partner2Id,
      childships: dataset.children
        .filter((c) => c.unionId === u.id)
        .map((c) => ({ childId: c.childId })),
    }));
    const included = collectIncludedPersonIds(
      dataset.focalPersonId,
      unions,
      2,
      2,
      1,
      0,
    );
    expect(included.has("cur-james")).toBe(true);
    expect(included.has("cur-leo")).toBe(true);
    expect(included.has("cur-rayan")).toBe(true);
    expect(included.has("cur-sana")).toBe(true);

    const people = new Map(
      dataset.persons
        .filter((p) => included.has(p.id))
        .map((p) => [
          p.id,
          { id: p.id, birthDate: p.birthDate, gender: p.gender },
        ]),
    );

    const { positions } = layoutMarriageCentricGraph(
      dataset.focalPersonId,
      people,
      unions,
      included,
      0,
      0,
      {
        phoneSingleParentSide: false,
        maxAncestorGenerations: 2,
        maxDescendantGenerations: 2,
      },
    );

    const kayY = positions.get("cur-kay")!.y;
    const zara = positions.get("cur-zara")!;
    const leo = positions.get("cur-leo")!;
    const rayan = positions.get("cur-rayan")!;
    const emma = positions.get("cur-emma")!;

    expect(zara.y).toBeGreaterThan(kayY);
    expect(leo.y).toBeGreaterThan(emma.y);
    expect(Math.abs(leo.x - zara.x)).toBeGreaterThan(
      PEDIGREE_CARD_SMALL_W + PEDIGREE_MIN_L_JOG,
    );
    expect(Math.abs(rayan.x - zara.x)).toBeGreaterThan(
      PEDIGREE_CARD_SMALL_W + PEDIGREE_MIN_L_JOG,
    );
    expect(positions.get("cur-james")!.y).toBe(emma.y);
  });
});
