import { buildCuratedPedigreeDemo } from "./buildCuratedPedigreeDemo";
import {
  collectIncludedPersonIds,
  layoutMarriageCentricGraph,
} from "../marriageTreeLayout";

describe("buildCuratedPedigreeDemo", () => {
  it("includes focal couple, both parent lines, siblings, and children", () => {
    const dataset = buildCuratedPedigreeDemo();
    expect(dataset.focalPersonId).toBe("cur-kay");

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
      1,
      1,
      1,
    );

    expect(included.has("cur-aisha")).toBe(true);
    expect(included.has("cur-rashid")).toBe(true);
    expect(included.has("cur-nadia")).toBe(true);
    expect(included.has("cur-hasan-rahman")).toBe(true);
    expect(included.has("cur-salma")).toBe(true);
    expect(included.has("cur-emma")).toBe(true);
    expect(included.has("cur-yusuf")).toBe(true);
    expect(included.has("cur-zara")).toBe(true);

    const people = new Map(
      dataset.persons.map((p) => [
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
      { phoneSingleParentSide: false },
    );

    const kayY = positions.get("cur-kay")!.y;
    expect(positions.get("cur-aisha")!.y).toBe(kayY);
    expect(positions.get("cur-zara")!.y).toBeGreaterThan(kayY);
    expect(positions.get("cur-emma")!.x).toBeLessThan(positions.get("cur-kay")!.x);
    expect(positions.get("cur-yusuf")!.x).toBeGreaterThan(
      positions.get("cur-aisha")!.x,
    );
    expect(positions.get("cur-rashid")!.y).toBeLessThan(kayY);
    expect(positions.get("cur-hasan-rahman")!.y).toBeLessThan(kayY);
  });
});
